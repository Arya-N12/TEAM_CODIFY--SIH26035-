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
Run the service with uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8005
```
This will run on `http://127.0.0.1:8005`. 
By default, the `ASR_ENGINE` environment variable is set to `indic_conformer`. If you do not have a Hugging Face token or access to the gated model, you can run in mock mode:
```bash
ASR_ENGINE=mock uvicorn app.main:app --host 127.0.0.1 --port 8005
```

## ASR Probe Results (ai4bharat/indic-conformer-600m-multilingual)
**Note:** The model `ai4bharat/indic-conformer-600m-multilingual` is currently gated on Hugging Face. We could not run the probe without an authentication token and explicit user agreement on the Hugging Face portal. 

**Recommendation:**
Since the model is gated, it's recommended to test UI with `ASR_ENGINE=mock` locally. For a production deployment, if `indic-conformer-600m-multilingual` is to be used, you will need to authenticate with Hugging Face via the `huggingface-cli login` or setting the `HF_TOKEN` environment variable, and the account must have been granted access to the repository.

Additionally, since English is not officially supported by this model, if it outputs Devanagari transliterations for English speech, an additional normalization layer (Devanagari to ASCII, fuzzy matching against Devanagari aliases) would be required. Alternatively, using a model like `faster_whisper` natively supports English and is not gated, making it a stronger candidate for this specific English-language prototype.
