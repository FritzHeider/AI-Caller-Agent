# Path: /api/voice/__init__.py

from fastapi import APIRouter
from .handler import router as voice_router

router = APIRouter()
router.include_router(voice_router)
