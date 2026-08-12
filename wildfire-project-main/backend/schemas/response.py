from pydantic import BaseModel

class PredictionResponse(BaseModel):
    pass

class HealthResponse(BaseModel):
    status: str

class ErrorResponse(BaseModel):
    detail: str
