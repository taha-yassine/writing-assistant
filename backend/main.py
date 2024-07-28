from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Iterable
import os
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import AsyncOpenAI
import instructor

load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
MODELZOO = [
    # LLama
    'meta-llama/llama-3.1-405b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'meta-llama/llama-3.1-8b-instruct:free',
    
    # Claude
    'anthropic/claude-3-haiku',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3-opus',

    # GPT
    'openai/gpt-4o-mini',
    'openai/gpt-4o',
]

class Request(BaseModel):
    text: str

class Response(BaseModel):
    errors: List[str]
    corrections: List[str]

class Suggestion(BaseModel):
    old: str = Field(description="Old text to be corrected")
    new: str = Field(description="New text to replace the old text")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = instructor.from_openai(AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
))

prompt = """
You are a writing assistant that helps correct and improve the piece of text you're provided with. You will provide corrections and improvements for the following aspects ONLY:
- Grammar
- Spelling
- Punctuation
Reply ONLY with a JSON list of suggested of corrections. Suggestions should be as atomic as possible.
"""

# Initialize SQLite database
def init_db():
    con = sqlite3.connect('history.db')
    c = con.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS history
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  timestamp TEXT,
                  model TEXT,
                  input TEXT,
                  output JSON)''')
    con.commit()
    con.close()

init_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/process")
async def process(request: Request):
    response = await client.chat.completions.create(
        model=MODELZOO[6],
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": request.text},
        ],
        response_model=Iterable[Suggestion]
    )

    # Log request to DB
    con = sqlite3.connect('history.db')
    c = con.cursor()
    c.execute("INSERT INTO history (timestamp, model, input, output) VALUES (?, ?, ?, ?)",
              (datetime.now().isoformat(), MODELZOO[6], request.text, json.dumps([r.model_dump() for r in response])))
    con.commit()
    con.close()

    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
