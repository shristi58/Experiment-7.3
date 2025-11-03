import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";

export default function App() {
  const [name, setName] = useState("");
  const [connected, setConnected] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function connect() {
    if (!name.trim()) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", name);
    });
    socket.on("message", (m) => {
      setMessages((prev) => [...prev, m]);
    });
  }

  function sendMessage() {
    if (!msg.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", msg);
    setMsg("");
  }

  return (
    <div className="chat-container">
      <h1>Real-Time Chat</h1>

      {!connected ? (
        <div className="join">
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={connect}>Join</button>
        </div>
      ) : (
        <div className="chat-area">
          <div className="messages" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={m.name === name ? "message mine" : "message"}>
                <div className="meta">
                  <strong>{m.name}</strong>{" "}
                  <span className="time">[{new Date(m.time).toLocaleTimeString()}]</span>
                </div>
                <div className="text">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            <input
              placeholder="Type your message..."
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
