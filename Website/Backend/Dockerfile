FROM python:3.10-slim

# Install system dependencies (ffmpeg is required for faster-whisper audio conversion)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt-lists/*

ENV PYTHONUNBUFFERED=1
ENV WHISPER_COMPUTE_TYPE=int8

WORKDIR /app

# Copy dependency requirements
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8005

# Start Uvicorn web server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8005}"]
