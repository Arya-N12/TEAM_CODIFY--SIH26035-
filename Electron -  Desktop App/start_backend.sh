#!/bin/bash
cd "NAWI_user/voice_service"
source venv/bin/activate
echo "Starting NAWI voice service backend on http://127.0.0.1:8005/"
ASR_ENGINE=faster_whisper uvicorn app.main:app --host 127.0.0.1 --port 9005
