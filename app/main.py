from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from app.graph.workflow import cyber_app
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sentinel AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    history: List[dict]
    score: int = 0
    current_quiz: Optional[dict] = None 
    # Frontend se session id mangwa sakte hain, ya static rakh sakte hain
    thread_id: str = "default_user_1" 
# main.py ke endpoint mein ye change karein
@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        
        new_messages = [request.history[-1]] if request.history else []
        
        input_state = {
            "messages": new_messages,
            "awareness_score": request.score,
            "current_quiz": request.current_quiz, 
            "user_intent": "",
            "language": "English"
        }
        
        final_state = cyber_app.invoke(input_state, config=config)
        last_msg = final_state["messages"][-1]
        if isinstance(last_msg, dict):
            response_text = last_msg.get("content", "")
        else:
            response_text = getattr(last_msg, "content", str(last_msg))

        return {
            "message": response_text,
            "score": final_state["awareness_score"],
            "quiz": final_state.get("current_quiz")
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"message": f"Agent error: {str(e)}", "score": request.score, "quiz": None}
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)