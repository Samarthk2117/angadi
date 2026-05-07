from typing import TypedDict, Annotated, List, Union
import operator

class AgentState(TypedDict):
    # 'operator.add' ensure karta hai ki purane messages delete na hon
    messages: Annotated[List[dict], operator.add]
    current_quiz: Union[dict, None]
    awareness_score: int
    user_intent: str  # 'learn' or 'quiz'
    language: str  # <--- Add this!