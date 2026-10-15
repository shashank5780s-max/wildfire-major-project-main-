from contextlib import asynccontextmanager
from pathlib import Path

from fastapi.staticfiles import StaticFiles
import os

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
os.makedirs("outputs", exist_ok=True)

app.mount(
    "/outputs",
    StaticFiles(directory="outputs"),
    name="outputs"
)
app.openapi_version = "3.0.2"
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

from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version="3.0.2",
        routes=app.routes,
    )

    upload_schema = schema["components"]["schemas"].get(
        "Body_upload_files_upload_post"
    )

    if upload_schema:
        upload_schema["properties"]["files"]["items"] = {
            "type": "string",
            "format": "binary"
        }

    app.openapi_schema = schema
    return app.openapi_schema

app.openapi = custom_openapi
