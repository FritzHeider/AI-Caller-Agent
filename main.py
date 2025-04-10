# Path: /main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.voice import router as voice_router

app = FastAPI(
    title="AI Sales Caller Backend",
    description="Handles Twilio voice calls, OpenAI responses, and CRM logging with Google Sheets sync.",
    version="1.0.0"
)

# CORS config if needed for frontend access (like uploading audio or calling internal APIs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(voice_router, prefix="/api/voice")

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Sales Agent is running 🚀"}
