import io
from fastapi import APIRouter, File, HTTPException, UploadFile
import numpy as np
from PIL import Image
from pydantic import BaseModel
from app.scripts.image_resizing import return_compressed_image_size

router = APIRouter(
    prefix="/image",
    tags=["Image"]
)

class ResizeAnalysisResponse(BaseModel):
    original_width: int
    original_height: int
    new_width: int
    new_height: int

@router.post("/resize-analysis", response_model=ResizeAnalysisResponse,
             summary= "Analyzes the provided image and returns an image compression size suggestion.")
async def image_resize_analysis(image_file: UploadFile = File(...)):
    # Image type validation
    if not image_file.content_type or not image_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image type")

    image_bytes = await image_file.read()

    # Image load validation
    try:
        image = Image.open(io.BytesIO(image_bytes))
        original_width, original_height = image.size
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Conversion and Analysis
    np_image = np.frombuffer(image_bytes, dtype=np.uint8)

    try:
        new_width, new_height = return_compressed_image_size(np_image)
    except Exception as ex:
        raise HTTPException(
            status_code=500, 
            detail="Somethin went wrong during compression analysis: " + str(ex)
        ) from ex

    return ResizeAnalysisResponse(
        original_width=original_width,
        original_height=original_height,
        new_width=new_width,
        new_height=new_height
    )
