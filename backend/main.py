from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import List, Iterable
import os
import sqlite3
import json
from datetime import datetime
from dotenv import load_dotenv
from openai import AsyncOpenAI
import instructor
from utils import diff_json

load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

# Clients
client_openrouter = instructor.from_openai(AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
))

client_tgi = AsyncOpenAI(
    base_url="http://0.0.0.0:8080/v1",
    api_key="-",
)

MODELZOO = [
    # LLama
    {"model": "meta-llama/llama-3.1-405b-instruct", "client": "openrouter"},
    {"model": "meta-llama/llama-3.1-70b-instruct", "client": "openrouter"},
    {"model": "meta-llama/llama-3.1-8b-instruct:free", "client": "openrouter"},
    
    # Claude
    {"model": "anthropic/claude-3-haiku", "client": "openrouter"},
    {"model": "anthropic/claude-3.5-sonnet", "client": "openrouter"},
    {"model": "anthropic/claude-3-opus", "client": "openrouter"},

    # GPT
    {"model": "openai/gpt-4o-mini", "client": "openrouter"},
    {"model": "openai/gpt-4o", "client": "openrouter"},

    # CoEdIT
    {"model": "grammarly/coedit-large", "client": "tgi"},
]

class TextRequest(BaseModel):
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
async def process(request: TextRequest):
    model = MODELZOO[-1]["model"]
    client = MODELZOO[-1]["client"]

    if client == "openrouter":
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": request.text},
            ],
            response_model=Iterable[Suggestion]
        )
        response_json = json.dumps([r.model_dump() for r in response])
    elif client == "tgi":
        response = await client.completions.create(
            model=model,
            prompt="Fix grammar, spelling, and punctuation: " + request.text,
            stream=False,
        )
        response = diff_json(request.text, response.choices[0].text)
        response_json = json.dumps(response)

    # Log request to DB
    con = sqlite3.connect('history.db')
    c = con.cursor()
    c.execute("INSERT INTO history (timestamp, model, input, output) VALUES (?, ?, ?, ?)",
              (datetime.now().isoformat(), model, request.text, response_json))
    con.commit()
    con.close()

    return response

templates = Jinja2Templates(directory="templates")

@app.get("/history", response_class=HTMLResponse)
async def get_dataset_view(request: Request, page: int = Query(1, ge=1), items_per_page: int = Query(50, ge=1, le=100)):
    con = sqlite3.connect('history.db')
    c = con.cursor()
    
    # Get total count of rows
    c.execute("SELECT COUNT(*) FROM history")
    total_items = c.fetchone()[0]
    
    # Calculate offset
    offset = (page - 1) * items_per_page
    
    # Fetch paginated data
    c.execute("SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?", (items_per_page, offset))
    dataset = c.fetchall()
    con.close()
    
    # Calculate total pages
    total_pages = -(-total_items // items_per_page)  # Ceiling division
    
    return templates.TemplateResponse("history.html", {
        "request": request,
        "dataset": dataset,
        "page": page,
        "total_pages": total_pages,
        "items_per_page": items_per_page
    })


@app.get("/database/coedit", response_class=HTMLResponse)
async def get_dataset_view(request: Request, page: int = Query(1, ge=1), items_per_page: int = Query(50, ge=1, le=100)):
    db_path = f'./gen/coedit.db'
    con = sqlite3.connect(db_path)
    c = con.cursor()
    
    # Get total count of rows
    c.execute(f"SELECT COUNT(*) FROM coedit")
    total_items = c.fetchone()[0]
    
    # Calculate offset
    offset = (page - 1) * items_per_page
    
    # Fetch paginated data
    c.execute(f"SELECT * FROM coedit LIMIT ? OFFSET ?", (items_per_page, offset))
    dataset = c.fetchall()
    con.close()
    
    # Calculate total pages
    total_pages = -(-total_items // items_per_page)  # Ceiling division
    
    return templates.TemplateResponse("coedit.html", {
        "request": request,
        "dataset": dataset,
        "page": page,
        "total_pages": total_pages,
        "items_per_page": items_per_page
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
