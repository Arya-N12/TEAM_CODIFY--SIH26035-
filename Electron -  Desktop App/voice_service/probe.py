import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import librosa
import soundfile as sf
import warnings
import time

warnings.filterwarnings('ignore')

model_id = "ai4bharat/indic-conformer-600m-multilingual"
print(f"Loading {model_id}...")

processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id, trust_remote_code=True)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

pipe = pipeline("automatic-speech-recognition", model=model, tokenizer=processor.tokenizer, feature_extractor=processor.feature_extractor, max_new_tokens=128, chunk_length_s=30, batch_size=16, device=0 if device == "cuda" else -1)

# Generate a synthetic audio using a TTS engine, or just generate a silent wave to see if model loads and infers.
# Actually we can just run on an empty tensor to check loading.
dummy_audio = torch.zeros(16000)
print("Model loaded. Running dummy inference...")
res = pipe({"sampling_rate": 16000, "raw": dummy_audio.numpy()})
print("Dummy result:", res)
