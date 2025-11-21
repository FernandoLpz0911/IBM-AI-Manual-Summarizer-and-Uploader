import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

def get_iam_token():
    """
    Exchanges the API Key for a temporary Bearer Token.
    """
    api_key = api_key = os.getenv("WATSONX_APIKEY")
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={api_key}"

    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"Failed to get IAM token: {response.text}")

def ask_watsonx(context_text, user_question):
    # 1. Get a fresh token
    access_token = get_iam_token()
    
    # 2. Prepare the URL (matches your snippet)
    url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
    
    # 3. Construct the Dynamic Prompt
    # We insert the actual document text and user question here
    prompt_input = f"""<|system|>
You are a helpful assistant for a manufacturing technician.
You are analyzing a technical document.
You must answer the user's question based ONLY on the context provided.
CRITICAL: Your output must be valid JSON. Do not add any text before or after the JSON.
The JSON format is:
{{
    "answer": "The short answer to the question",
    "reference_index": <The integer index of the paragraph where the answer was found>
}}

<|user|>
Context:
[0] The safety valve pressure must be checked every 4 hours.
[1] If the pressure exceeds 50 PSI, initiate the emergency shutdown sequence immediately.
[2] To reset the system, turn the master key to the 'OFF' position and wait 30 seconds.

Question:
When should I shut down the system?

<|assistant|>
{{
    "answer": "You must initiate the emergency shutdown sequence immediately if the pressure exceeds 50 PSI.",
    "reference_index": 1
}}

<|user|>
Context:
{context_text}

Question:
{user_question}

<|assistant|>
{{"""

    # 4. Prepare the Body (Matches your snippet exactly)
    body = {
        "input": prompt_input,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 200,
            "min_new_tokens": 0,
            "repetition_penalty": 1
        },
        "model_id": "ibm/granite-3-8b-instruct",
        "project_id": os.getenv("PROJECT_ID"), # Loaded from .env
        "moderations": {
            "hap": {"input": {"enabled": True, "threshold": 0.5}, "output": {"enabled": True, "threshold": 0.5}},
            "pii": {"input": {"enabled": True, "threshold": 0.5}, "output": {"enabled": True, "threshold": 0.5}}
        }
    }

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    # 5. Send Request
    try:
        response = requests.post(url, headers=headers, json=body)
        
        if response.status_code != 200:
            print(f"Error from WatsonX: {response.text}")
            return {"answer": "Error contacting AI.", "reference_index": None}

        data = response.json()
        
        # 6. Parse Response
        # The API returns the generated text inside 'results'
        generated_text = data['results'][0]['generated_text']
        
        # The AI gives us the REST of the JSON, so we attach the "{" back
        full_json_string = "{" + generated_text
        
        # Clean up potential trailing characters
        # sometimes AI adds a standard stop sequence or newlines
        full_json_string = full_json_string.strip()
        
        return json.loads(full_json_string)

    except Exception as e:
        print(f"Exception in ask_watsonx: {e}")
        return {"answer": "I encountered an error processing the document.", "reference_index": None}