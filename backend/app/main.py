from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import image

app = FastAPI(title="Cross Stitch Tool Backend")

# Prefix all routes with /api
app.include_router(image.router, prefix="/api")

app.add_middleware( # TODO ONLY FOR DEV
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["old-width", "old-height"]
)
