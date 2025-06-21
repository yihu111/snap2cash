# app.py
import os
import json
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── CONFIG ─────────────────────────────────────────────────────────────────────
LANGFLOW_BASE    = os.getenv("LANGFLOW_BASE", "http://127.0.0.1:7860")
IMAGE_FLOW_ID    = os.getenv("IMAGE_FLOW_ID", "23171265-914d-43fe-bd78-a73a86532086")
PRICE_FLOW_ID    = os.getenv("PRICE_FLOW_ID", "f70c5462-87b4-4ff4-9747-11604b07c29e")
IMAGE_INPUT_ID   = os.getenv("IMAGE_INPUT_ID", "ChatInput-51dID")   # your Image flow’s ChatInput component ID
PRICE_INPUT_ID   = os.getenv("PRICE_INPUT_ID", "ChatInput-51dID")   # your Price flow’s ChatInput component ID

UPLOAD_URL_IMAGE = f"{LANGFLOW_BASE}/api/v1/files/upload/{IMAGE_FLOW_ID}"
RUN_URL_IMAGE    = f"{LANGFLOW_BASE}/api/v1/run/{IMAGE_FLOW_ID}"
RUN_URL_PRICE    = f"{LANGFLOW_BASE}/api/v1/run/{PRICE_FLOW_ID}"

XI_API_KEY       = os.getenv("XI_API_KEY", "sk_99a5880a73b698beba241c538aba048dd3758aa3d8f415e7")  # your ElevenLabs key
# ────────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Langflow Image & Price Demo")

# Allow the React frontend to call our endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    1) Upload the image to the IMAGE_FLOW Langflow flow
    2) Run that flow to extract a single text output
    3) Return JSON { image_analysis_result: "<text>" }
    """
    # 1) upload file
    try:
        resp1 = requests.post(
            UPLOAD_URL_IMAGE,
            headers={"Accept": "application/json"},
            files={"file": (file.filename, await file.read(), file.content_type)},
            timeout=600,
        )
        resp1.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, detail=f"Image upload failed: {e}")

    upload_data = resp1.json()
    file_path = upload_data.get("file_path")
    if not file_path:
        raise HTTPException(502, detail="No file_path returned from Langflow")

    # 2) run the image-processing flow
    run_payload = {
        "input_type":  "chat",
        "output_type": "chat",
        "tweaks": {
            IMAGE_INPUT_ID: {
                "files":       file_path,
                "input_value": ""
            }
        }
    }
    try:
        resp2 = requests.post(
            RUN_URL_IMAGE,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            data=json.dumps(run_payload),
            timeout=600,
        )
        resp2.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, detail=f"Image flow run failed: {e}")

    data = resp2.json()
    # extract the last assistant message
    msg = None
    if isinstance(data.get("messages"), list) and data["messages"]:
        msg = data["messages"][-1].get("message")
    if msg is None:
        try:
            msg = data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
        except Exception:
            msg = None

    if msg is None:
        raise HTTPException(502, detail="Image flow did not return any text")

    # return that text for the voice agent
    return {"image_analysis_result": msg}


@app.post("/price-analysis")
async def price_analysis(body: dict):
    """
    1) Accept {"description": "<item description>", "transcript": "<full chat transcript>"}
    2) Run the PRICE_FLOW Langflow flow with a combined prompt
    3) Return JSON { listing: { title, description, price, category } }
    """
    description = body.get("description")
    transcript  = body.get("transcript")
    if not description or not transcript:
        raise HTTPException(400, detail="Both `description` and `transcript` are required")

    # Combine the description and the chat transcript into one prompt
    combined_input = f"Item description: {description}\n\nConversation so far:\n{transcript}"

    run_payload = {
        "input_type":  "chat",
        "output_type": "chat",
        "tweaks": {
            PRICE_INPUT_ID: {
                "input_value": combined_input
            }
        }
    }

    try:
        resp = requests.post(
            RUN_URL_PRICE,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            data=json.dumps(run_payload),
            timeout=600,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, detail=f"Price flow run failed: {e}")

    data = resp.json()

    # Extract the last assistant message
    msg = None
    if isinstance(data.get("messages"), list) and data["messages"]:
        msg = data["messages"][-1].get("message")
    if msg is None:
        try:
            msg = data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
        except Exception:
            msg = None

    if msg is None:
        raise HTTPException(502, detail="Price flow did not return any text")

    # Parse the JSON listing returned by the flow
    try:
        parsed = json.loads(msg)
        # expected shape: { title, description, price, category }
        return {"listing": parsed}
    except ValueError:
        raise HTTPException(502, detail="Price flow did not return valid JSON")


@app.get("/api/getTranscript/{conversation_id}")
def get_transcript(conversation_id: str):
    """
    Proxy to ElevenLabs to fetch full transcript for a given conversation_id.
    Returns {"conversation_id": "...", "transcript": "USER: ...\nAI: ..."}
    """
    url = f"https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"
    headers = {"xi-api-key": XI_API_KEY}
    resp = requests.get(url, headers=headers, timeout=30)
    if not resp.ok:
        raise HTTPException(resp.status_code, detail=resp.text)

    data = resp.json()
    msgs = data.get("transcript", [])
    transcript = "\n".join(f"{m['role'].upper()}: {m['message']}" for m in msgs)
    return {
        "conversation_id": conversation_id,
        "transcript": transcript or "<no messages — make sure endSession() has run>"
    }
