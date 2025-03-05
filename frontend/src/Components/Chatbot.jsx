import React, { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([]); // Store chat messages
  const [input, setInput] = useState(""); // Store user input

  // Function to send message to backend
  const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: "user", text: input };
  setMessages([...messages, userMessage]);

  try {
    const response = await fetch("http://localhost:5002/solo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const botMessage = { sender: "bot", text: data.response };

    setMessages([...messages, botMessage]);
  } catch (error) {
    console.error("Error communicating with chatbot:", error);
  }

  setInput("");
};


  return (
    <div style={styles.container}>
      <h2>Chatbot</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              textAlign: msg.sender === "user" ? "right" : "left",
              backgroundColor: msg.sender === "user" ? "#DCF8C6" : "#E3E3E3",
            }}
          >
            <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

// Basic inline CSS styles
const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    fontFamily: "Arial, sans-serif",
  },
  chatBox: {
    height: "300px",
    overflowY: "auto",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px",
    marginBottom: "10px",
  },
  message: {
    padding: "8px",
    borderRadius: "10px",
    marginBottom: "5px",
    maxWidth: "80%",
    display: "inline-block",
  },
  inputContainer: {
    display: "flex",
  },
  input: {
    flex: 1,
    padding: "5px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  button: {
    padding: "5px 10px",
    marginLeft: "5px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Chatbot;
