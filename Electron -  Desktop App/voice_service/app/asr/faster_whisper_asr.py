import os
import threading
import logging
from faster_whisper import WhisperModel
import subprocess
import tempfile

logger = logging.getLogger(__name__)

class FasterWhisperASR:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(FasterWhisperASR, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        with self._lock:
            if self._initialized:
                return
                
            self.model_name = os.getenv("WHISPER_MODEL", "medium.en")
            self.device = os.getenv("WHISPER_DEVICE", "cpu")
            self.compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
            self.cache_dir = os.getenv("WHISPER_CACHE_DIR", os.path.join(os.path.expanduser("~"), ".cache", "whisper"))
            
            logger.info(f"Initializing FasterWhisperASR with model={self.model_name}, device={self.device}, compute_type={self.compute_type}")
            try:
                self.model = WhisperModel(
                    self.model_name,
                    device=self.device,
                    compute_type=self.compute_type,
                    download_root=self.cache_dir
                )
                self._initialized = True
                logger.info("FasterWhisperASR initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize FasterWhisperASR: {e}")
                raise RuntimeError(f"Failed to load Whisper model: {e}")

    def _convert_audio(self, input_path: str) -> str:
        """
        Converts input audio to 16kHz mono WAV using system ffmpeg.
        Returns the path to the converted temporary file.
        Caller is responsible for cleaning up the temporary file.
        """
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".wav")
        os.close(tmp_fd)
        
        try:
            # Run ffmpeg to convert to 16000Hz mono pcm_s16le
            cmd = [
                "ffmpeg",
                "-y",              # Overwrite
                "-i", input_path,
                "-ar", "16000",
                "-ac", "1",
                "-c:a", "pcm_s16le",
                tmp_path
            ]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode != 0:
                os.remove(tmp_path)
                raise RuntimeError(f"FFmpeg audio conversion failed: {result.stderr}")
            return tmp_path
        except Exception as e:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            raise e

    def transcribe(self, audio_path: str, language: str = "en") -> str:
        # Note: 'language' parameter from endpoint might be passed.
        # But our model is likely 'medium.en', so it expects English.
        if "en" in self.model_name:
            lang_to_use = "en"
        else:
            lang_to_use = language

        converted_path = None
        try:
            # Pre-process audio for robustness
            converted_path = self._convert_audio(audio_path)
            
            import soundfile as sf
            audio_data, _ = sf.read(converted_path, dtype='float32')
            
            # Use technical prompt to bias the model towards numbers/decimals/units
            initial_prompt = "A technical NAWI inspection context including model numbers, serial numbers, measurements, and decimals."
            
            segments, info = self.model.transcribe(
                audio_data,
                language=lang_to_use,
                beam_size=5,
                condition_on_previous_text=False, # Avoid hallucinations in short utterances
                initial_prompt=initial_prompt,
                word_timestamps=False
            )
            
            transcript_texts = []
            for segment in segments:
                transcript_texts.append(segment.text.strip())
                
            return " ".join(transcript_texts)
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise RuntimeError(f"Transcription failed: {e}")
        finally:
            if converted_path and os.path.exists(converted_path):
                os.remove(converted_path)
