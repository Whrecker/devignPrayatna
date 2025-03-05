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
        <div className="h-screen w-full flex justify-center items-center">
            <div class="grid"></div>
        <div className="w-1/2"  style={styles.container}>
            <h2 className="text-3xl text-white">Chatbot</h2>
            <div style={styles.chatBox}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.message,
                            textAlign: msg.sender === "user" ? "right" : "left",
                            backgroundColor: msg.sender === "user" ? "#DCF8C6" : "#E3E3E3",
                            alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong> {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex  justify-between items-center" style={styles.inputContainer}>
                {/* <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.input}
                /> */}
                    <div id="poda">
                        <div class="glow"></div>
                        <div class="darkBorderBg"></div>
                        <div class="darkBorderBg"></div>
                        <div class="darkBorderBg"></div>

                        <div class="white"></div>

                        <div class="border"></div>

                        <div id="main" >
                            <input type="text" name="text" class="input"
                            
                            
                                
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={styles.input}
                             />
                            <div id="input-mask"></div>
                            <div id="pink-mask"></div>
                            
                            
                        </div>
                    </div>
                
                    <button onClick={sendMessage} className="group relative bg-slate-900 h-12 w-28 border-2 border-teal-600 text-white text-base font-bold rounded-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:border-emerald-400 hover:text-emerald-300 p-3 text-left before:absolute before:w-10 before:h-10 before:content[''] before:right-2 before:top-2 before:z-10 before:bg-indigo-500 before:rounded-full before:blur-lg before:transition-all before:duration-500 after:absolute after:z-10 after:w-16 after:h-16 after:content[''] after:bg-teal-400 after:right-6 after:top-4 after:rounded-full after:blur-lg after:transition-all after:duration-500 hover:before:right-10 hover:before:-bottom-4 hover:before:blur hover:after:-right-6 hover:after:scale-110" >
                    Send
                </button>
            </div>
        </div>
        </div>
    );
}

// Basic inline CSS styles
const styles = {
    container: {
        maxWidth: "600px",
        // margin: "auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "500px",
    },
    chatBox: {
        flex: 1,
        height: "300px",
        overflowY: "auto",
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
        marginBottom: "10px",
        display: "flex",
        flexDirection: "column",
    },
    message: {
        padding: "8px",
        borderRadius: "10px",
        marginBottom: "5px",
        maxWidth: "80%",
        display: "inline-block",
        wordWrap: "break-word",
    },
    inputContainer: {
        display: "flex",
    },
    input: {
        flex: 1,
        padding: "5px",
        // border: "1px solid #ddd",
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