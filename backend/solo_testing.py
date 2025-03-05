import requests
import json
from flask import Flask, render_template, request, jsonify, Response
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
def chatbot(prompt):
    system_prompt = (
        "You are an intelligent AI assistant trained to provide helpful, "
        "concise, and accurate responses. Your goal is to assist users "
        "effectively with a friendly and professional tone. "
        "If a question is unclear, ask for clarification."
    )

    payload = {
        "model": "llama3.2",  # Adjust this based on your available model
        "prompt": f"{system_prompt}\n\nUser: {prompt}\nAI:",
        "stream": False  # Set to True if you want a streaming response
    }

    headers = {
        "Content-Type": "application/json"
    }

    api_url = "http://localhost:11434/api/generate"

    try:
        response = requests.post(api_url, headers=headers, data=json.dumps(payload))
        
        if response.status_code == 200:
            data = response.json()
            return data.get("response")
        else:
            return f"Error {response.status_code}: {response.text}"
    
    except requests.exceptions.RequestException as e:
        return f"Request failed: {e}"
@app.route('/solo', methods=["POST", "GET"])
def solo_chat():
    try:
        prompt = request.get_json()
        if not prompt or "message" not in prompt:
            return jsonify({"error": "Invalid input"}), 400

        prompt_text = prompt["message"]
        print(prompt_text)

        # Process chatbot response
        resp = chatbot(str(prompt_text))
        print(resp)

        # Return JSON response properly
        return jsonify({"response": resp})
    
    except Exception as e:
        print(f"Error in solo_chat: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False,host="0.0.0.0",port=5002)
