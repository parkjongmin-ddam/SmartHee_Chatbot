import os
import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class ChatResponse(BaseModel):
    reply: str
    input_tokens: int
    output_tokens: int


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        temperature=0.7,
        messages=[{"role": m.role, "content": m.content} for m in request.messages],
    )

    return ChatResponse(
        reply=response.content[0].text,
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )
