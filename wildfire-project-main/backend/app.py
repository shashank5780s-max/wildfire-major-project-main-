from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import prediction, upload

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = PROJECT_ROOT / "outputs"

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Wildfire Vision AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

app.include_router(upload.router)
app.include_router(prediction.router)

@app.get("/")
def read_root():
    return {"app": "Wildfire Vision AI", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
