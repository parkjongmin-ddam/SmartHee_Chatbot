from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="SmartHee Chatbot", lifespan=lifespan)

# 허용할 origin 목록
origins = [
    "https://smart-hee-chatbot.vercel.app",
]

# 로컬 개발 환경도 허용
if os.getenv("ENVIRONMENT") == "development":
    origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # * 대신 명시적 URL
    allow_credentials=True,
    allow_methods=["POST"],      # GET 불필요, POST만 허용
    allow_headers=["Content-Type"],
)

from api.chat import router as chat_router
app.include_router(chat_router, prefix="/api")