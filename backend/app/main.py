from scripts.image_resizing import compress_image_and_return_pixel_sizes
from fastapi import FastAPI
from routers import hello

app = FastAPI(title="Minimal API Example")

# Prefix all routes with /api
app.include_router(hello.router, prefix="/api")

compress_image_and_return_pixel_sizes("fake", "fake")