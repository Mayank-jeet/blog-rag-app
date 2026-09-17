from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes_blog import router as blog_router
from app.api.routes_threads import router as threads_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://blog-rag-app.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blog_router)
app.include_router(threads_router)