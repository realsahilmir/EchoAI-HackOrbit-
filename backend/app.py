from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# 🔐 Replace this with your real AssemblyAI API key
ASSEMBLY_KEY = "5a0a40b51fcb4fe18ff5c919ed467eb4"

UPLOAD_URL = "https://api.assemblyai.com/v2/upload"
TRANSCRIBE_URL = "https://api.assemblyai.com/v2/transcript"

headers = {
    "authorization": ASSEMBLY_KEY
}

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    temp_path = "temp.webm"
    audio_file.save(temp_path)

    try:
        # 🔼 Upload the audio to AssemblyAI
        with open(temp_path, 'rb') as f:
            upload_response = requests.post(UPLOAD_URL, headers=headers, data=f)

        if upload_response.status_code != 200:
            print("❌ Upload error:", upload_response.text)
            return jsonify({"error": "Failed to upload audio"}), 500

        audio_url = upload_response.json()['upload_url']

        # 📝 Request transcription
        transcript_response = requests.post(
            TRANSCRIBE_URL,
            json={"audio_url": audio_url},
            headers=headers
        )

        if transcript_response.status_code != 200:
            print("❌ Transcription request error:", transcript_response.text)
            return jsonify({"error": "Transcription failed"}), 500

        transcript_id = transcript_response.json()['id']

        # 🔁 Poll until the transcription is complete
        while True:
            poll_response = requests.get(f"{TRANSCRIBE_URL}/{transcript_id}", headers=headers)
            result = poll_response.json()

            if result['status'] == 'completed':
                print("✅ Transcript:", result['text'])
                return jsonify({"transcript": result['text']})

            elif result['status'] == 'failed':
                print("❌ Polling failed:", result)
                return jsonify({"error": "Transcription failed"}), 500

            time.sleep(2)

    except Exception as e:
        print("❌ Backend error:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)