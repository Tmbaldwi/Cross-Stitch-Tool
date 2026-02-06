from fastapi import FastAPI
from app.routers import image

app = FastAPI(title="Cross Stitch Tool Backend")

# Prefix all routes with /api
app.include_router(image.router, prefix="/api")