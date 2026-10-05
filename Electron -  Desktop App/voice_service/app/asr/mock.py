import time

class MockASR:
    def __init__(self):
        print("MockASR initialized")

    def transcribe(self, audio_path: str, language: str = "en") -> str:
        # Simulate processing time
        time.sleep(1.5)
        # Mock responses based on some logic, or just a default string
        # To make it useful for UI testing, we can check if it's the dummy test
        return "applicant name Apex Weigh Systems, contact Rajesh Mehta, same as applicant"
