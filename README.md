# 🛍️ Snap2Cash

Snap2Cash is a hackathon project that lets users quickly generate product listings using images and AI. Upload a photo and our Langflow-powered workflow handles the rest — extracting details and posting a listing to the marketplace automatically while getting the most relevant details about the item!

## 🚀 Features

- **Agentic AI Integration** by working in an orchestrated manner to gather all information: 
    - Uses [Langflow](https://langflow.org/) to extract titles, descriptions, and categories from uploaded images. An orchestrator agent calls the relevant agents/tools specialised to different tasks (e.g., after the research agent, the pricing agent gets called by the orchestrator agent and it uses the previous information).
    - **ElevenLabs**: A key feature is that after uploading the image, a voice agent further asks relevant and concise questions relating to the image used in the following workflow.
- **Instant Listings**: Auto-populates and posts listings to a mock marketplace hosted on Vercel (eBay Developer Program takes several days for verification).

## 🧠 How It Works

1. User uploads a product image and is asked questions by the voice agent.
2. Langflow processes the image and returns listing details using an agentic workflow.
3. Supabase stores the image and listing in the database.
4. Listing appears instantly in the marketplace interface.

Note: In the future, the listing can be uploaded to many different marketplaces such as eBay (using its API interface)! The marketplace interface can be found [here](https://my-listing-app-tawny.vercel.app/)! 

## 🙌 Authors

- William Foster
- Lucas Chan
- Yile Huang

Built for Hacking Agents Hackathon – June 2025 – London. **It was fun!!!**
