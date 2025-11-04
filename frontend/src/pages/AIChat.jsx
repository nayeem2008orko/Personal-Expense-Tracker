import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/AIchat.css";

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true); // start loading

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });
      const data = await res.json();
      const aiMessage = { sender: "ai", text: data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { sender: "ai", text: "AI service unavailable." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // stop loading
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <div className={`ai-sidebar ${open ? "open" : ""}`}>
        <div className="ai-header">
          <h3>AI Assistant</h3>
          <button onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`ai-message ${m.sender === "user" ? "user" : "ai"}`}
            >
              {m.sender === "ai" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-message ai">
              <span className="dot-loading">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
        <div className="ai-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      <button className="ai-toggle" onClick={() => setOpen(!open)}>
        🤖
      </button>
    </>
  );
}