import React, { useState, useEffect } from 'react';
import VoiceRecorder from './VoiceRecorder';
import './App.css';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey! I’m Echo. Ask me what you said on any day 📅" }
  ]);
  const [input, setInput] = useState('');
  const [memory, setMemory] = useState([]);

  // 🔥 Load transcripts from Firebase in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "transcripts"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setMemory(data);
    });

    return () => unsubscribe(); // cleanup listener on unmount
  }, []);

  const handleTranscribe = (data) => {
    const { text, summary, tags } = data;

    const userMessage = { role: 'user', text };
    const botMessage = {
      role: 'bot',
      text: `Summary: "${summary}"\nTags: ${tags.join(', ')}`
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const query = input.toLowerCase();
const keywords = query
  .replace(/[^\w\s]/gi, '') // remove punctuation
  .split(' ')
  .filter(word => !['what', 'is', 'said', 'about', 'did', 'you', 'say', 'on', 'the', 'a', 'an', 'and', 'of'].includes(word));

const matched = memory.find((m) => {
  const summary = m.summary?.toLowerCase() || '';
  const text = m.text?.toLowerCase() || '';
  const tags = m.tags?.map(t => t.toLowerCase()) || [];

  return keywords.some((word) =>
    summary.includes(word) || text.includes(word) || tags.includes(word)
  );
});

      const messageText = matched?.summary && matched.summary !== "No summary generated"
        ? matched.summary
        : matched?.text;

      const botMessage = matched
        ? {
            role: 'bot',
            text: `You said on ${matched.timestamp.toDate().toDateString()}: "${messageText}"`
          }
        : {
            role: 'bot',
            text: "Hmm, I couldn't find anything related to that. 🧐"
          };

      setMessages((prev) => [...prev, botMessage]);
    }, 800);

    setInput('');
  };

  return (
    <div className="chat-container">
      <h1>Echo 🧠</h1>
      <VoiceRecorder onTranscribe={handleTranscribe} />
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Echo anything..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;