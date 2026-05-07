import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Always resolve .env from the app directory, regardless of launch cwd.
APP_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=APP_ENV_PATH)

# 2. Check if the key was actually found (Demo Safety)
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found! Check your .env file on this PC.")

# 3. Initialize the model
gemini_flash = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=api_key, # Explicitly passing it is safer for demos
    temperature=0.7
)
