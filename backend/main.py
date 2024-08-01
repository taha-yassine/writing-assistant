import re
from fastapi import FastAPI, HTTPException
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
client_openrouter = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

client_openrouter_instructor = instructor.from_openai(AsyncOpenAI(
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

prompt_xml = """
You are a writing assistant that helps correct and improve the piece of text you're provided with. You will provide corrections and improvements for the following aspects ONLY:
- Grammar
- Spelling
- Punctuation

Examples:
<input>
Hi Dan We are goes to go around " Cinepolis " I've seen a very beautiful film and I wanting to sees it again, the film is " Los increibles " it's a funny film I am sure you are going to enjoy, we'll go with all my friends so I'll see you at despite home at 7: 00 pm and we will be in the cinema for 8 o'clock see you
</input>

<output>
Hi Dan We are <suggestion data="going">goes</suggestion> to go <suggestion data="to">around</suggestion> " Cinepolis <suggestion data="&quot;.">"</suggestion> I've seen a very beautiful film and I <suggestion data="want">wanting</suggestion> to <suggestion data="see">sees</suggestion> it again, the film is " Los increibles <suggestion data="&quot;,">"</suggestion> it's a funny <suggestion data="film,">film</suggestion> I am sure you <suggestion data="are">being</suggestion> going to <suggestion data="enjoy it,">enjoy,</suggestion> we'll go with all my friends <suggestion data="so I'll see">by I seen</suggestion> you <suggestion data="at">despite</suggestion> home at 7: 00 pm and we will be in the cinema <suggestion data="at">for</suggestion> 8 <suggestion data="o'clock. See">o'clock see</suggestion> you
</output>

##########

<input>
We, as mexican people, must works hard together to finding a ways to explate and develope the Mexican tourist industries, which not only gave us the " dollars " we need but helps us to recovered all the natural resources that have been highly destroyed and not due towards the tourists industry itself.
</input>

<output>
We, as <suggestion data="Mexican">mexican</suggestion> people, must <suggestion data="work">works</suggestion> hard together to <suggestion data="find">finding</suggestion> a <suggestion data="way">ways</suggestion> to <suggestion data="exploit">explate</suggestion> and <suggestion data="develop">develope</suggestion> the Mexican tourist <suggestion data="industry,">industries,</suggestion> which not only <suggestion data="gives">gave</suggestion> us the " dollars " we need but helps us to <suggestion data="recover">recovered</suggestion> all the natural resources that have been highly destroyed and not due <suggestion data="to">towards</suggestion> the <suggestion data="tourist">tourists</suggestion> industry itself.
</output>

##########

<input>
Now a day student changed many aspects around thier study in orders to study useful subject without the filed that they really liking to study therefore, that will reflect the benefit on I students and the socities However, some people believe that student upon they  allowed to studied useful only regardless  their diser which will give  the motivate to carried on studies, In my opinion we should allow them to studying what they like and where rather than restricted them within word certain subjects such as science and technology, and also we should incourage our student to choos. the eara that might be flowrshing their life and transferring the knowledges they obtains along prctices.
</input>

<output>
<suggestion data="Nowadays students have">Now a day student</suggestion> changed many aspects <suggestion data="of their studies">around thier study</suggestion> in <suggestion data="order">orders</suggestion> to study useful <suggestion data="subjects in a field">subject without the filed</suggestion> that they really <suggestion data="like">liking</suggestion> to study therefore, that will <suggestion data="be reflected in">reflect</suggestion> the benefit <suggestion data="to">on I</suggestion> students and <suggestion data="societies.">the socities</suggestion> However, some people believe that <suggestion data="students, if">student upon</suggestion> they <suggestion data="are"></suggestion> allowed to <suggestion data="study something">studied</suggestion> useful <suggestion data="only,">only</suggestion> regardless <suggestion data="of"></suggestion> their <suggestion data="desire">diser</suggestion> which will give <suggestion data="them"></suggestion> the <suggestion data="motivation">motivate</suggestion> to <suggestion data="carry">carried</suggestion> on <suggestion data="studying.">studies,</suggestion> In my opinion we should allow them to <suggestion data="study">studying</suggestion> what they like and where rather than <suggestion data="restricting">restricted</suggestion> them <suggestion data="to choosing">within word</suggestion> certain subjects such as science and technology, and also we should <suggestion data="encourage">incourage</suggestion> our <suggestion data="students">student</suggestion> to <suggestion data="choose in">choos.</suggestion> the <suggestion data="era when their life">eara that</suggestion> might be <suggestion data="flourishing">flowrshing their life</suggestion> and <suggestion data="put">transferring</suggestion> the <suggestion data="knowledge">knowledges</suggestion> they <suggestion data="obtain into practice.">obtains along prctices.</suggestion>
</output>

Suggestions should be as atomic as possible.
"""

prompt_json = """
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
                  format TEXT,
                  input TEXT,
                  output TEXT)''')
    con.commit()
    con.close()

init_db()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/process")
async def process(request: TextRequest, format: str = "xml"):
    model = MODELZOO[4]["model"]
    client = MODELZOO[4]["client"]

    if format == "xml":
        if client == "openrouter":
            response = await client_openrouter.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt_xml},
                    {"role": "user", "content": request.text},
                    {"role": "assistant", "content": "<output>\n"},
                ],
            )
            response = re.sub(r'^\s*|\s*<\/output>\s*$', '', response.choices[0].message.content)
            if not verify_correction(request.text, response):
                raise HTTPException(status_code=400, detail="Could not produce a valid response")
    elif format == "json":
        if client == "openrouter":
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": prompt_json},
                    {"role": "user", "content": request.text},
                ],
                response_model=Iterable[Suggestion]
            )
            response = json.dumps([r.model_dump() for r in response])
        elif client == "tgi":
            response = await client.completions.create(
                model=model,
                prompt="Fix grammar, spelling, and punctuation: " + request.text,
                stream=False,
            )
            response = diff_json(request.text, response.choices[0].text)
            response = json.dumps(response)

    # Log request to DB
    con = sqlite3.connect('history.db')
    c = con.cursor()
    c.execute("INSERT INTO history (timestamp, model, format, input, output) VALUES (?, ?, ?, ?, ?)",
              (datetime.now().isoformat(), model, format, request.text, response))
    con.commit()
    con.close()

    return response

templates = Jinja2Templates(directory="templates")

@app.get("/history", response_class=HTMLResponse)
async def get_dataset_view(page: int = 1, items_per_page: int = 50):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")
    if not 1 <= items_per_page <= 100:
        raise HTTPException(status_code=400, detail="Items per page must be between 1 and 100")

    with sqlite3.connect('history.db') as con:
        c = con.cursor()
        
        # Get total count of rows
        c.execute("SELECT COUNT(*) FROM history")
        total_items = c.fetchone()[0]
        
        # Calculate offset
        offset = (page - 1) * items_per_page
        
        # Fetch paginated data
        c.execute("SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?", (items_per_page, offset))
        dataset = c.fetchall()
    
    # Calculate total pages
    total_pages = -(-total_items // items_per_page)  # Ceiling division
    
    return templates.TemplateResponse("history.html", {
        "request": {},
        "dataset": dataset,
        "page": page,
        "total_pages": total_pages,
        "items_per_page": items_per_page
    })


@app.get("/dataset/coedit", response_class=HTMLResponse)
async def get_dataset_view(split: str = "train", page: int = 1, items_per_page: int = 50):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")
    if not 1 <= items_per_page <= 100:
        raise HTTPException(status_code=400, detail="Items per page must be between 1 and 100")
    if split not in ["train", "eval"]:
        raise HTTPException(status_code=400, detail="Split must be either 'train' or 'eval'")

    db_path = './data/coedit.db'
    with sqlite3.connect(db_path) as con:
        c = con.cursor()
        
        # Get total count of rows for the selected set
        c.execute("SELECT COUNT(*) FROM dataset WHERE split = ?", (split,))
        total_items = c.fetchone()[0]
        
        # Calculate offset
        offset = (page - 1) * items_per_page
        
        # Fetch paginated data for the selected set
        c.execute("SELECT * FROM dataset WHERE split = ? ORDER BY id ASC LIMIT ? OFFSET ?", (split, items_per_page, offset))
        dataset = c.fetchall()
    
    # Calculate total pages
    total_pages = -(-total_items // items_per_page)  # Ceiling division
    
    return templates.TemplateResponse("coedit.html", {
        "request": {},
        "dataset": dataset,
        "page": page,
        "total_pages": total_pages,
        "items_per_page": items_per_page
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
