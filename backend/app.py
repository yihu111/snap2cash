# app.py
import os
import json
import requests
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ── CONFIG ─────────────────────────────────────────────────────────────────────
LANGFLOW_BASE = os.getenv("LANGFLOW_BASE", "http://127.0.0.1:7860")
FLOW_ID       = os.getenv("LANGFLOW_FLOW_ID", "f70c5462-87b4-4ff4-9747-11604b07c29e")
CHAT_INPUT_ID = os.getenv("CHAT_INPUT_ID", "ChatInput-51dID")  # ← replace with your ChatInput component ID
UPLOAD_URL    = f"{LANGFLOW_BASE}/api/v1/files/upload/{FLOW_ID}"
RUN_URL       = f"{LANGFLOW_BASE}/api/v1/run/{FLOW_ID}"
# ────────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Langflow Image-Chat Demo")

# Allow the React dev server to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # or ["*"] to allow any
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    # 1) Upload the raw file to Langflow’s file store
    try:
        resp1 = requests.request(
            "POST",
            UPLOAD_URL,
            headers={"Accept": "application/json"},
            data={},
            files={"file": (file.filename, await file.read(), file.content_type)},
            timeout=600,
        )
        resp1.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, detail=f"Upload failed: {e}")

    upload_data = resp1.json()
    file_path = upload_data.get("file_path")
    if not file_path:
        raise HTTPException(502, detail="Upload did not return file_path")

    # 2) Run the flow, telling the ChatInput component about our upload
    run_payload = {
        "input_type":  "chat",
        "output_type": "chat",
        "tweaks": {
            CHAT_INPUT_ID: {
                "files":       file_path,
                "input_value": ""  # or supply a prompt here
            }
        }
    }
    try:
        resp2 = requests.post(
            RUN_URL,
            headers={
                "Content-Type": "application/json",
                "Accept":       "application/json",
            },
            data=json.dumps(run_payload),
            timeout=600,
        )
        resp2.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(502, detail=f"Flow run failed: {e}")

    # 3) Extract only the assistant’s text message
    data = resp2.json()

    # Try the top-level "messages" array first
    msg = None
    if isinstance(data.get("messages"), list) and data["messages"]:
        msg = data["messages"][-1].get("message")

    # Fallback to the nested outputs path
    if msg is None:
        try:
            msg = data["outputs"][0]["outputs"][0]["results"]["message"]["data"]["text"]
        except Exception:
            msg = None

    # If no message found, return full JSON for inspection
    if msg is None:
        return data

    # If the message is itself JSON, parse it and wrap under "listing"
    try:
        parsed = json.loads(msg)
        return {"listing": parsed}
    except ValueError:
        # Not JSON? return as plain-text message
        return {"message": msg}

