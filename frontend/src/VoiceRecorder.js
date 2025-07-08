import React, { useState, useRef } from 'react';
import axios from 'axios';
import { db } from './firebase'; // adjust path if needed
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function VoiceRecorder({ onTranscribe }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        try {
          const res = await axios.post("http://localhost:5000/transcribe", formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          const transcriptText = res.data.transcript;

          // ✅ Save to Firebase Firestore
          await addDoc(collection(db, "transcripts"), {
            text: transcriptText,
            summary: "No summary generated",
            tags: ["voice", "recording"],
            timestamp: serverTimestamp()
          });

          // ➕ Update frontend as usual
          onTranscribe({
            text: transcriptText,
            summary: "No summary generated",
            tags: ["voice", "recording"]
          });

        } catch (err) {
          console.error("❌ Error processing audio:", err);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("🎙️ Mic access denied or error:", err);
    }
  };

  const handleStop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <div>
      <button onClick={recording ? handleStop : handleStart}>
        {recording ? "🛑 Stop Recording" : "🎙️ Start Recording"}
      </button>
    </div>
  );
}

export default VoiceRecorder;