from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
MODEL = 'anthropic/claude-3-haiku'

class Request(BaseModel):
    text: str

class Response(BaseModel):
    errors: List[str]
    corrections: List[str]

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
Reply ONLY with a list of incorrect items and their suggested correction. That would correspond to the Answer bellow.

> Example
Input:
Onceupon a tyme, in a far-of kingdum,, their lived a yung princes named Lila. She wuz knoen four bravry her and kind-ness, but alsso for her aqward social skil.s

Output:
Onceupon -> Once upon
tyme -> time
far-of -> far-off
kingdum -> kingdom
kingdum, -> kingdom,
their -> there
yung -> young
princes -> princess
wuz -> was
knoen -> known
four -> for
bravry her -> her bravery
kind-ness -> kindness
alsso -> also
aqward -> awkward
skil.s -> skills
"""
# prompt = """
# Test
# """

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/process")
async def process(request: Request):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            },
            json={
                "model": MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": prompt
                    },
                    {
                        "role": "user",
                        "content": 'Input:\n'+request.text
                    },
                    {
                        "role": "assistant",
                        "content": 'Output:\n'
                    },
                ],
                "stream": False
            }
        )
    response_data = response.json()
    
    if 'choices' not in response_data or not response_data['choices']:
        raise HTTPException(status_code=500, detail="Unexpected response from OpenRouter API")
    
    content = response_data['choices'][0]['message']['content']
    
    lines = [line.strip() for line in content.split('\n') if line.strip()]
    
    errors = []
    corrections = []
    for line in lines:
        if '->' in line:
            error, correction = line.split('->')
            errors.append(error.strip())
            corrections.append(correction.strip())
    
    return Response(errors=errors, corrections=corrections)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
