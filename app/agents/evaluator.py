from langchain_google_genai import ChatGoogleGenerativeAI
# or from langchain_groq import ChatGroq
import os
from langchain_groq import ChatGroq
model = ChatGroq(model="meta-llama/llama-4-scout-17b-16e-instruct")

def evaluator_node(state):
    quiz = state.get('current_quiz')
    user_msg = state['messages'][-1]['content']
    current_score = state.get('awareness_score', 0)

    if not quiz:
        return {"messages": [{"role": "assistant", "content": "No active quiz found."}]}

    # --- THE SYSTEM PROMPT ---
    evaluator_prompt = f"""
    You are the Sentinel Evaluator. 
    QUIZ SCENARIO: {quiz['scenario']}
    CORRECT ANSWER: {quiz['correct']}
    LOGIC: {quiz['explanation']}

    USER RESPONSE: "{user_msg}"

    TASK:
    1. Determine if the user is correct (even if they explain it in Hindi/Marathi/English instead of just saying A or B).
    2. If correct, start with "✅ CORRECT!". Add the points (10).
    3. If wrong, start with "❌ NOT QUITE.".
    4. RESPOND IN THE USER'S LANGUAGE.
    5. No conversational fluff.
    """

    response = model.invoke(evaluator_prompt)
    
    # Logic to update score if AI says it's correct
    is_correct = "✅" in response.content
    new_score = current_score + 10 if is_correct else current_score

    return {
        "awareness_score": new_score,
        "current_quiz": None, # Clear quiz after evaluation
        "messages": [{"role": "assistant", "content": response.content}]
    }