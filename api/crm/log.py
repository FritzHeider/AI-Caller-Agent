# Path: /api/crm/log.py

import os
import datetime
from supabase import create_client, Client
from google.oauth2 import service_account
from googleapiclient.discovery import build

# === Supabase Config ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# === Google Sheets Config (Optional) ===
GOOGLE_SHEET_ID = os.getenv("SHEET_ID")
SHEET_NAME = "Leads"
SERVICE_ACCOUNT_FILE = "google-service-account.json"
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
sheets_service = build("sheets", "v4", credentials=credentials)

def sync_to_google_sheets(timestamp, transcript, response, audio_url=""):
    """Append a new row to the Google Sheet."""
    sheet = sheets_service.spreadsheets()
    values = [[timestamp, transcript, response, audio_url]]
    body = {"values": values}
    result = sheet.values().append(
        spreadsheetId=GOOGLE_SHEET_ID,
        range=f"{SHEET_NAME}!A:D",
        valueInputOption="RAW",
        insertDataOption="INSERT_ROWS",
        body=body
    ).execute()
    return result

def log_to_crm(transcript: str, response: str, audio_url: str = ""):
    """Log to Supabase (primary) and Google Sheets (optional)."""
    timestamp = datetime.datetime.utcnow().isoformat()

    # Log to Supabase
    supabase.table("crm_logs").insert({
        "timestamp": timestamp,
        "lead_transcript": transcript,
        "ai_response": response,
        "audio_url": audio_url
    }).execute()

    # Optional sync to Sheets
    sync_to_google_sheets(timestamp, transcript, response, audio_url)
