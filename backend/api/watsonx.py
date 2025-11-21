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
    
    # 2. Prepare the URL
    url = "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
    
    # 3. Construct the Prompt using your Fine-Tuned Structure
    # We use the system instructions and few-shot examples you provided, 
    # then append the actual user context and question at the end.
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

CRITICAL INSTRUCTION:
If the user's question cannot be answered exclusively by the provided Context, you MUST return the following JSON exactly:
{{
    "answer": "I cannot answer this based on the current document. Please check the manual manually or refine your search.",
    "reference_index": null
}}

Do not attempt to guess or use outside knowledge.

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
[0] Change the oil every 500 hours.

Question:
What type of coolant should I use?

<|assistant|>
{{
    "answer": "I cannot answer this based on the current document. Please check the manual manually or refine your search.",
    "reference_index": null
}}

<|user|>
Context:
To adjust the steering wheel: 1. Pull the lever down. 2. Move the steering wheel up or down. 3. Pull or push the steering wheel closer or away from you. 4. Pull the lever up to lock the steering wheel in place. Do not adjust the steering wheel while driving

Question:
What is the last thing I have to do to adjust the steering wheel?

<|assistant|>
{{
    "answer": "The last thing you have to do to adjust the steering wheel is to pull the lever up to lock the steering wheel in place.",
    "reference_index": 4
}}

<|user|>
Context:
[0] The machine should be cleaned daily.
[1] Use a soft cloth and a degreaser to clean the machine.
[2] Rinse the machine with clean water after cleaning.
[3] Wipe the machine dry with a clean towel.

Question:
What should I do after rinsing the machine with clean water?

<|assistant|>
{{
    "answer": "After rinsing the machine with clean water, you should wipe the machine dry with a clean towel.",
    "reference_index": 3
}}

<|user|>
Context:
Push and hold the POWER button for 3 seconds.
This simple action turns the vehicle OFF and immediately shuts down the highvoltage system controllers, preventing current flow into the cables. It also cuts power to the airbags and front seat belt tensioners, though these pyrotechnic devices have up to a 3-minute deactivation time.
To prevent accidental restarting, you must remove the keyless remote from the vehicle and move it at least 20 feet away.
If you cannot locate the keyless remote, disconnect the negative terminal from the 12-volt battery to prevent electrical fires and accidental restarting of the vehicle.

Question:
What happens if you hold the power button for 3 seconds?

<|assistant|>
{{
    "answer": "If you hold the power button for 3 seconds, the vehicle turns OFF and immediately shuts down the high-voltage system controllers, preventing current flow into the cables. It also cuts power to the airbags and front seat belt tensioners, though these pyrotechnic devices have up to a 3-minute deactivation time.",
    "reference_index": 1
}}

<|user|>
Context:
{context_text}

Question:
{user_question}

<|assistant|>
{{"""

    # 4. Prepare the Body (Using your fine-tuned parameters)
    body = {
        "input": prompt_input,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 200,
            "min_new_tokens": 0,
            "repetition_penalty": 1
        },
        "model_id": "ibm/granite-3-8b-instruct",
        "project_id": os.getenv("PROJECT_ID"), 
        "moderations": {
            "hap": {
                "input": {"enabled": True, "threshold": 0.5, "mask": {"remove_entity_value": True}},
                "output": {"enabled": True, "threshold": 0.5, "mask": {"remove_entity_value": True}}
            },
            "pii": {
                "input": {"enabled": True, "threshold": 0.5, "mask": {"remove_entity_value": True}},
                "output": {"enabled": True, "threshold": 0.5, "mask": {"remove_entity_value": True}}
            },
            "granite_guardian": {
                "input": {"threshold": 1}
            }
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
            return {"answer": f"Error contacting AI ({response.status_code})", "reference_index": None}

        data = response.json()
        
        # 6. Parse Response
        generated_text = data['results'][0]['generated_text']
        
        # The AI gives us the REST of the JSON, so we attach the "{" back
        full_json_string = "{" + generated_text
        
        # Clean up potential trailing characters or whitespace
        full_json_string = full_json_string.strip()
        
        return json.loads(full_json_string)

    except Exception as e:
        print(f"Exception in ask_watsonx: {e}")
        # Fallback in case parsing fails
        return {"answer": "I encountered an error processing the document.", "reference_index": None}