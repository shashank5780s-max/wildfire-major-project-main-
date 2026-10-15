import os
import glob
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from ..utils.preprocessing import ImagePreprocessor
from ..services.unet_service import UNetService
from ..services.convlstm_service import ConvLSTMService
from ..services.analytics import Analytics
from ..services.predictor import Predictor

router = APIRouter(prefix="/predict", tags=["prediction"])

class PredictionRequest(BaseModel):
    sequence: Optional[str] = None

# Lazy load the predictor to avoid loading models on import
_predictor_instance = None

def get_predictor() -> Predictor:
    global _predictor_instance
    if _predictor_instance is None:
        try:
            preprocessor = ImagePreprocessor()

            unet_service = UNetService("models/unet_fire_segmentation_final.pth")
            unet_service.load_model()


            convlstm_service = ConvLSTMService(r"D:\archive\convlstm_retrained_best.pth")
            convlstm_service.load_model()


            analytics = Analytics()

            _predictor_instance = Predictor(
                preprocessor=preprocessor,
                unet_service=unet_service,
                convlstm_service=convlstm_service,
                analytics=analytics
            )
        except Exception as e:
            raise RuntimeError(f"Failed to initialize AI services: {str(e)}")

    return _predictor_instance

@router.post("")
def predict(request: PredictionRequest, predictor: Predictor = Depends(get_predictor)):
    # Determine the folder path based on mode
    if request.sequence:
        folder_path = os.path.join("sample_data", request.sequence)
    else:
        folder_path = "uploads"

    # Check if folder exists
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail=f"Directory not found: {folder_path}")

    # Gather TIFF files and deduplicate entries. On Windows, .TIFF and .tiff may resolve to the same files.
    patterns = [
    "*.TIFF", "*.tiff", "*.TIF", "*.tif",
    "*.JPG", "*.jpg", "*.JPEG", "*.jpeg"]
    tiff_files = sorted({match for pattern in patterns for match in glob.glob(os.path.join(folder_path, pattern))})

    # Check if we have exactly 5 files
    if len(tiff_files) == 0:
        raise HTTPException(status_code=404, detail="No TIFF, JPG, or JPEG images found in the directory.")
    elif len(tiff_files) != 5:
        raise HTTPException(status_code=400,detail=f"Expected exactly 5 images, found {len(tiff_files)}.")

    try:
        prediction = predictor.predict(tiff_files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    response = {
        "status": "success",
        **prediction,
    }

    return response
