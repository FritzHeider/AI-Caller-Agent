# Path: /api/voice/handler.py

from fastapi import APIRouter, Request, Form
from fastapi.responses import PlainTextResponse
from twilio.twiml.voice_response import VoiceResponse
from api.crm.log import log_to_crm
import openai
import os

router = APIRouter()

# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/voice")
async def handle_voice(request: Request):
    form = await request.form()
    user_input = form.get("SpeechResult", "")

    # Call GPT-4 to generate response
    completion = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful AI sales assistant. Keep it brief and persuasive."},
            {"role": "user", "content": user_input}
        ]
    )

    ai_reply = completion["choices"][0]["message"]["content"]

    # Optional: You can generate and upload audio with ElevenLabs here
    audio_url = ""  # Placeholder if TTS audio is generated

    # Log call to JSONL and Google Sheets
    log_to_crm(transcript=user_input, response=ai_reply, audio_url=audio_url)

    # Respond via Twilio TTS
    response = VoiceResponse()
    response.say(ai_reply, voice="Polly.Joanna")  # You can change voice or use <Play> with audio_url
    return PlainTextResponse(str(response), media_type="application/xml")
