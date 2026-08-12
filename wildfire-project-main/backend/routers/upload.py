import os
import rasterio
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_EXTENSIONS = {".tif", ".tiff", ".TIF", ".TIFF"}

@router.post("")
async def upload_files(files: List[UploadFile] = File(...)):
    # 1. Exactly five images
    if len(files) != 5:
        raise HTTPException(status_code=400, detail=f"Expected exactly 5 images, but got {len(files)}.")
        
    # 2. All filenames unique
    filenames = [f.filename for f in files]
    if len(set(filenames)) != 5:
        raise HTTPException(status_code=400, detail="All filenames must be unique.")
        
    # 3. Read contents and check basic limits/extensions
    file_contents = []
    for file in files:
        ext = os.path.splitext(file.filename)[1]
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {ext}. Only .tif and .tiff are allowed.")
            
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds the maximum allowed size of 50MB.")
        if len(content) == 0:
            raise HTTPException(status_code=422, detail=f"File {file.filename} is empty.")
            
        file_contents.append((file.filename, content))
        
    # 4. Clear previous uploads
    if os.path.exists(UPLOAD_DIR):
        try:
            for f in os.listdir(UPLOAD_DIR):
                file_path = os.path.join(UPLOAD_DIR, f)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to clear previous uploads: {str(e)}")
    else:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
    # 5. Save and validate dimensions/readability
    saved_paths = []
    first_image_shape = None
    
    try:
        for filename, content in file_contents:
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            with open(file_path, "wb") as f:
                f.write(content)
            saved_paths.append(file_path)
            
            # Validate readable and dimensions
            try:
                with rasterio.open(file_path) as src:
                    shape = (src.height, src.width)
                    if first_image_shape is None:
                        first_image_shape = shape
                    elif shape != first_image_shape:
                        raise HTTPException(status_code=422, detail=f"Images must have the same dimensions. Expected {first_image_shape}, got {shape} for {filename}.")
            except rasterio.errors.RasterioIOError:
                raise HTTPException(status_code=422, detail=f"File {filename} is not a valid or readable TIFF image.")
                
    except HTTPException as e:
        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)
        raise e
    except Exception as e:
        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
        
    return {
        "status": "success",
        "uploaded_images": 5,
        "directory": "backend/uploads/"
    }
