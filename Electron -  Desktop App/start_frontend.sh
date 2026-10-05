#!/bin/bash
echo "Starting NAWI frontend server on http://localhost:5500/"
echo "Press Ctrl+C to stop."
python3 -m http.server 5500
