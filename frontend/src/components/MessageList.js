import React, { useState } from 'react';

function MessageList({ messages }) {
  const [query, setQuery] = useState("");

  const filtered = messages.filter(msg =>
    msg.text.toLowerCase().includes(query.toLowerCase()) ||
    msg.summary.toLowerCase().includes(query.toLowerCase()) ||
    msg.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Ask Echo anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 && query !== "" && (
        <p>No conversations matched your search 🕵️‍♂️</p>
      )}

      {filtered.map((msg, i) => (
        <div key={i} className="message-card">
          <p><strong>Transcript:</strong> {msg.text}</p>
          <p><strong>Summary:</strong> {msg.summary}</p>
          <p><strong>Tags:</strong> {msg.tags.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}

export default MessageList;