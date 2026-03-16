import os
import anthropic
import secrets
from fastapi import APIRouter, HTTPException, Request, Header
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


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
@limiter.limit("30/minute")
async def chat(
    request: Request,
    body: ChatRequest,
    x_app_token: str = Header(default=None)
):
    expected_token = os.getenv("APP_TOKEN")
    if not expected_token or not secrets.compare_digest(x_app_token or "", expected_token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        temperature=0.7,
        messages=[{"role": m.role, "content": m.content} for m in body.messages],
    )

    return ChatResponse(
        reply=response.content[0].text,
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )
