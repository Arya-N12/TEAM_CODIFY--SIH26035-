import os
import requests
import time
import subprocess

print("Generating a sample test audio file using 'say' command...")
audio_path = "test_audio.wav"

if not os.path.exists(audio_path):
    text = "This is a test of the applicant section for the NAWI inspection. The applicant name is Apex Weigh Systems. The maximum capacity is 500 kilograms."
    subprocess.run(["say", "-o", audio_path, "--data-format=LEI16@16000", text], check=True)
    print("Generated test_audio.wav")

print(f"Testing local server at http://127.0.0.1:8005")

# Check Health
try:
    health = requests.get("http://127.0.0.1:8005/api/voice/health").json()
    print("Health Status:", health)
except Exception as e:
    print("Failed to reach server. Please start it with 'uvicorn app.main:app --host 127.0.0.1 --port 8005'")
    exit(1)

print("Running Transcribe & Extract...")
start_time = time.time()
with open(audio_path, "rb") as f:
    files = {"audio": (audio_path, f, "audio/wav")}
    data = {"section_id": "applicant", "language": "en"}
    response = requests.post("http://127.0.0.1:8005/api/voice/transcribe-extract", files=files, data=data)

end_time = time.time()
print(f"Request took {end_time - start_time:.2f} seconds")

if response.status_code == 200:
    print("Success! Response:")
    print(response.json())
else:
    print("Error:", response.status_code, response.text)
