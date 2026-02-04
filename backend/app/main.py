from fastapi import FastAPI
from app.routers import hello

app = FastAPI(title="Minimal API Example")

# Prefix all routes with /api
app.include_router(hello.router, prefix="/api")
