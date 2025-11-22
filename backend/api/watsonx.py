import requests
import os
import json
import re
from dotenv import load_dotenv

load_dotenv()

def get_iam_token():
    api_key = os.getenv("WATSONX_APIKEY")
    if not api_key:
        raise Exception("WATSONX_APIKEY is missing in Docker Environment!")

    url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={api_key}"

    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"Failed to get IAM token: {response.text}")

def ask_watsonx(context_text, user_question):
    raw_text = "No output generated."
    try:
        # 1. Setup
        access_token = get_iam_token()
        project_id = os.getenv("PROJECT_ID")
        
        if not project_id:
            return {"answer": "DEBUG: PROJECT_ID is missing in .env", "reference_index": None}
        
        # 2. Prompt
        prompt_input = f"""<|system|>
You are a helpful assistant for a manufacturing technician.
CRITICAL: Output VALID JSON only.

INSTRUCTIONS:
1. Search "Context" for the answer. Return "reference_index".
2. If not found (e.g. general knowledge), use your own knowledge and set "reference_index": null.
3. If you absolutely cannot answer, return "answer": "I could not find an answer."

FORMAT:
{{
    "answer": "...",
    "reference_index": <number OR null>
}}

<|user|>
Context:
[0] The safety valve pressure must be checked every 4 hours.
[1] If the pressure exceeds 50 PSI, initiate the emergency shutdown sequence immediately.

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
"""
        url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
        
        body = {
            "input": prompt_input,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 300,
                "min_new_tokens": 0,
                "repetition_penalty": 1.1
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

        # 3. Request
        response = requests.post(url, headers=headers, json=body)
        
        if response.status_code != 200:
            return {"answer": f"IBM ERROR: {response.status_code} - {response.text}", "reference_index": None}

        data = response.json()
        raw_text = data['results'][0]['generated_text']
        print(f"DEBUG RAW AI OUTPUT: {raw_text}") 

        # 4. Parsing
        parsed_json = {}
        try:
            start_index = raw_text.find('{')
            end_index = raw_text.rfind('}')
            
            if start_index != -1 and end_index != -1 and start_index < end_index:
                json_string = raw_text[start_index : end_index + 1]
                parsed_json = json.loads(json_string)
            else:
                parsed_json = {"answer": raw_text.strip(), "reference_index": None}

        except json.JSONDecodeError:
            clean_str = raw_text.replace("```json", "").replace("```", "").strip()
            parsed_json = {"answer": clean_str, "reference_index": None}

        # 5. Normalize & Validate (THE FIX IS HERE)
        final_answer = None
        
        # Check for various capitalization keys
        for key in ["answer", "Answer", "ANSWER", "response"]:
            if key in parsed_json:
                final_answer = parsed_json[key]
                break
        
        # If the answer is missing or empty string, provide a default text
        if final_answer is None or str(final_answer).strip() == "":
             final_answer = "I'm sorry, I couldn't find a specific answer to that question in the document or my general knowledge."

        return {
            "answer": final_answer,
            "reference_index": parsed_json.get("reference_index")
        }

    except Exception as e:
        return {"answer": f"PYTHON SYSTEM ERROR: {str(e)}", "reference_index": None}