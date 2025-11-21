import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

def get_iam_token():
    """
    Exchanges the API Key for a temporary Bearer Token.
    """
    api_key = os.getenv("WATSONX_APIKEY")
    
    # DEBUG CHECK: Ensure key exists
    if not api_key:
        raise Exception("WATSONX_APIKEY is missing in Docker Environment! Check docker-compose.yml")
        
    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={api_key}"

    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"IAM Token Failed: {response.status_code} - {response.text}")

def ask_watsonx(context_text, user_question):
    """
    Sends the document context and question to IBM Watsonx.
    Returns a JSON object with 'answer' and 'reference_index'.
    """
    try:
        # 1. Get a fresh token
        access_token = get_iam_token()
        
        # 2. Validate Project ID
        project_id = os.getenv("PROJECT_ID")
        if not project_id:
             return {"answer": "DEBUG: PROJECT_ID is missing in Docker Environment!", "reference_index": None}

        # 3. Prepare the URL
        url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
        
        # 4. Construct the Dynamic Prompt
        # We force the AI to output JSON by starting the response with "{"
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
{context_text}

Question:
{user_question}

<|assistant|>
{{"""

        # 5. Prepare the Request Body
        body = {
            "input": prompt_input,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 200,
                "min_new_tokens": 0,
                "repetition_penalty": 1
            },
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": project_id,
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

        # 6. Send Request
        response = requests.post(url, headers=headers, json=body)
        
        # DEBUG: If IBM returns an error, show it in the chat bubble
        if response.status_code != 200:
            return {"answer": f"IBM ERROR: {response.status_code} - {response.text}", "reference_index": None}

        data = response.json()
        
        # 7. Parse Response
        generated_text = data['results'][0]['generated_text']
        
        # Re-attach the opening brace
        full_json_string = "{" + generated_text
        
        # --- THE FIX: Cut off everything after the last '}' ---
        last_brace_index = full_json_string.rfind("}")
        if last_brace_index != -1:
            full_json_string = full_json_string[:last_brace_index+1]
        # ------------------------------------------------------
        
        return json.loads(full_json_string)

    except Exception as e:
        # DEBUG: Catch any python/system errors and show them in the chat bubble
        return {"answer": f"PYTHON SYSTEM ERROR: {str(e)}", "reference_index": None}