from langgraph.graph import StateGraph, END
from app.graph.state import AgentState
from app.agents.awareness import awareness_node
from app.agents.gamification import gamification_node
from app.agents.evaluator import evaluator_node
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver # Sync version
# 1. Router Logic define 
def router(state):
    last_msg = state['messages'][-1]
    if isinstance(last_msg, dict):
        user_text = last_msg.get('content', '').lower()
    else:
        user_text = getattr(last_msg, 'content', str(last_msg)).lower()
    if state.get('current_quiz'):
        return "evaluator"
    if "quiz" in user_text:
        return "gamification"
    return "awareness"

# 2. Build the Workflow (ORDER MATTERS HERE)
workflow = StateGraph(AgentState)

# Nodes add karein
workflow.add_node("awareness", awareness_node)
workflow.add_node("gamification", gamification_node)
workflow.add_node("evaluator", evaluator_node)

# Entry point aur edges set karein
workflow.set_conditional_entry_point(
    router,
    {
        "awareness": "awareness",
        "gamification": "gamification",
        "evaluator": "evaluator"
    }
)

workflow.add_edge("awareness", END)
workflow.add_edge("gamification", END)
workflow.add_edge("evaluator", END)

# 3. Database connection aur Compilation (Hamesha end mein)
conn = sqlite3.connect("sentinel_memory.db", check_same_thread=False)
memory = SqliteSaver(conn)
# Is app object ko main.py use karega
cyber_app = workflow.compile(checkpointer=memory)