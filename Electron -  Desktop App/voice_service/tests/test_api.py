import pytest
from fastapi.testclient import TestClient
import os
import io

# We need to test the API, but first set env vars so we can control the engine
os.environ["ASR_ENGINE"] = "mock"
os.environ["MAX_AUDIO_SIZE_MB"] = "1"

from app.main import app

def test_health_check():
    with TestClient(app) as client:
        response = client.get("/api/voice/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["engine"] == "mock"
        assert data["model_loaded"] is True

def test_schema_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/voice/schema")
        assert response.status_code == 200
        data = response.json()
        assert "sections" in data
        assert any(section["id"] == "applicant" for section in data["sections"])

def test_transcribe_extract_success():
    # Provide a dummy valid audio file
    dummy_audio = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x80>\x00\x00\x00}\x00\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
    
    files = {
        "audio": ("test.wav", io.BytesIO(dummy_audio), "audio/wav")
    }
    data = {
        "section_id": "applicant",
        "language": "en"
    }
    
    with TestClient(app) as client:
        response = client.post("/api/voice/transcribe-extract", files=files, data=data)
        assert response.status_code == 200
        json_data = response.json()
        assert "transcript" in json_data
        # Since it's mock, it returns a hardcoded string
        assert "fields" in json_data
        assert "duration" in json_data

def test_transcribe_extract_invalid_mimetype():
    files = {
        "audio": ("test.txt", io.BytesIO(b"hello world"), "text/plain")
    }
    data = {
        "section_id": "applicant"
    }
    with TestClient(app) as client:
        response = client.post("/api/voice/transcribe-extract", files=files, data=data)
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

def test_transcribe_extract_missing_section():
    dummy_audio = b"RIFF...WAVE..."
    files = {
        "audio": ("test.wav", io.BytesIO(dummy_audio), "audio/wav")
    }
    with TestClient(app) as client:
        response = client.post("/api/voice/transcribe-extract", files=files)
        assert response.status_code == 422 # FastAPI validation error for missing Form field

def test_transcribe_extract_large_audio():
    # MAX_AUDIO_SIZE_MB is set to 1 in this test environment.
    # We will send slightly more than 1MB
    large_audio = b"0" * (1 * 1024 * 1024 + 10)
    files = {
        "audio": ("test.wav", io.BytesIO(large_audio), "audio/wav")
    }
    data = {
        "section_id": "applicant"
    }
    with TestClient(app) as client:
        response = client.post("/api/voice/transcribe-extract", files=files, data=data)
        assert response.status_code == 413
        assert "Audio size exceeds" in response.json()["detail"]

def test_transcribe_extract_empty_audio():
    files = {
        "audio": ("test.wav", io.BytesIO(b""), "audio/wav")
    }
    data = {
        "section_id": "applicant"
    }
    with TestClient(app) as client:
        response = client.post("/api/voice/transcribe-extract", files=files, data=data)
        assert response.status_code == 400
        assert "Empty audio file provided" in response.json()["detail"]
