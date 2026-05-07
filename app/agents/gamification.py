from app.core.llm_client import gemini_flash
import json
import re

QUIZ_PROMPT = """
You are the Sentinel Gamification Agent. 
GOAL: Generate realistic, bilingual phishing simulations.

STRICT PROTOCOLS:
1. LANGUAGE: If the user speaks Marathi or Hindi, translate the 'scenario' and 'explanation' into that language.
2. OUTPUT FORMAT: You must return ONLY a JSON object. No prose.
3. JSON STRUCTURE:
{
  "scenario": "{Localized scam scenario}",
  "options": ["A: Real", "B: Fake"],
  "correct": "B",
  "explanation": "{Localized reason why it is a scam}",
  "points": 10
}
4. SCENARIO RULES: Focus on high-urgency scams (Bank, OTP, or Delivery alerts). Keep the scenario under 2 sentences.
"""

def gamification_node(state):
    # We add a 'user' message because the Gemini SDK requires it to generate content.
    messages = [
        {"role": "system", "content": QUIZ_PROMPT},
        {"role": "user", "content": "Please generate a new 'Fake vs Real' quiz for me."}
    ]
    
    response = gemini_flash.invoke(messages)
    
    # Clean and parse the JSON response
    try:
        json_str = re.sub(r"```json|```", "", response.content).strip()
        quiz_data = json.loads(json_str)
    except Exception as e:
        # Better error logging for debugging
        print(f"JSON Parsing Error: {e}")
        quiz_data = {"scenario": "Error generating quiz. Type 'retry' to try again."}

    return {
        "current_quiz": quiz_data,
        "messages": [{"role": "assistant", "content": f"🎯 **QUIZ TIME!**\n\n{quiz_data.get('scenario', 'No scenario available.')}"}]
    }