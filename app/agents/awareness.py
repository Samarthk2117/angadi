from app.core.llm_client import gemini_flash

AWARENESS_PROMPT = """
You are the Sentinel Awareness Agent. 
GOAL: Provide high-density cybersecurity education.

STRICT PROTOCOLS:
1. LANGUAGE: Detect the user's language (Marathi, Hindi, or English). Respond ONLY in that language.
2. BREVITY: No conversational fillers (e.g., No 'Hello', 'Great question', or 'I hope this helps').
3. STRUCTURE: Respond strictly using this Markdown format:
   - **[CONCEPT]:** {Name of the scam/tactic in 2 words}
   - **[WHY]:** {Why it works psychologically in 1 sentence}
   - **[PROTECT]:** {1 clear action step to stay safe}

4. LIMIT: Total response must be under 60 words.
"""

def awareness_node(state):
    # Retrieve history from the graph state
    messages = [{"role": "system", "content": AWARENESS_PROMPT}] + state['messages']
    
    response = gemini_flash.invoke(messages)
    
    # We return the new message to be 'added' to the state
    return {"messages": [{"role": "assistant", "content": response.content}]}