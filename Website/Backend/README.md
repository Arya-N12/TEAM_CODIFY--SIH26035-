# Voice Service

This is the backend service for the NAWI Voice Entry feature.

## Requirements
- Python 3.10+
- `ffmpeg` (must be installed on the system)

## Setup
1. Create a virtual environment: `python3 -m venv venv`
2. Activate it: `source venv/bin/activate`
3. Install dependencies: `pip install -r requirements.txt`

## Running the Service
The service uses Faster Whisper (`small.en`) by default. Copy `.env.example` to
`.env` to customize the model, device, or cache directory. The model is
downloaded on first startup, and `ffmpeg` must be available on your `PATH`.

Run the service with uvicorn from this directory:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8005
```
This will run on `http://127.0.0.1:8005`. For UI testing without loading a
recognition model, set `ASR_ENGINE=mock` before starting:
```bash
ASR_ENGINE=mock uvicorn app.main:app --host 127.0.0.1 --port 8005
```

## ASR Probe Results (ai4bharat/indic-conformer-600m-multilingual)
**Note:** The model `ai4bharat/indic-conformer-600m-multilingual` is currently gated on Hugging Face. We could not run the probe without an authentication token and explicit user agreement on the Hugging Face portal. 

**Recommendation:**
For this English-language prototype, the service uses Faster Whisper by default,
which supports English without access to the gated Indic Conformer model. The
Indic Conformer implementation is not included in this service.

The frontend microphone controls on `NAWI_user/pages/new-test.html` submit
recordings to this service and apply extracted values to the matching form
fields. Run the page from a local web server (for example, port 5500) and start
this service separately on port 8005.
