from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import image
from app.scripts.thread_color_screen_scrape import get_thread_list, get_thread_list_lab_tree

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.threads = get_thread_list()
    app.state.lab_color_tree = get_thread_list_lab_tree()
    yield

app = FastAPI(title="Cross Stitch Tool Backend", lifespan=lifespan)

# Prefix all routes with /api
app.include_router(image.router, prefix="/api")

app.add_middleware( # TODO ONLY FOR DEV
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["old-width", "old-height", "old-color-count", "new-color-count"],
)
