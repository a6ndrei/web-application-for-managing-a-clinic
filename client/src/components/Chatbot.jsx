import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bună ziua! Sunt asistentul AI VitaMed. Cum vă pot ajuta astăzi?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        message: input,
        history: messages.slice(-10),
      });

      const botResponse = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error calling AI:", error);
      const errorMsg =
        error.response?.data?.error ||
        "Îmi pare rău, am întâmpinat o problemă tehnică. Vă rugăm să reveniți mai târziu.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMsg,
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-status"></div>
        <span>VitaMed AI Assistant</span>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot typing">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chatbot-input" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Întrebați ceva..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping}>
          Trimite
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
