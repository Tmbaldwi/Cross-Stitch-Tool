import base64
import io
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
import numpy as np
from PIL import Image
from pydantic import BaseModel
from app.scripts.image_resizing import return_compressed_image

router = APIRouter(
    prefix="/image",
    tags=["Image"]
)

class ResizeAnalysisResponse(BaseModel):
    old_width: int
    old_height: int
    new_width: int
    new_height: int
    image_base64: str 

@router.post("/resize-image", summary= "Analyzes the provided image and returns a (potentially) compressed image along with dimensional changes.")
async def image_resize_analysis(image_file: UploadFile = File(...)):
    # Image type validation
    if not image_file.content_type or not image_file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image type")

    image_bytes = await image_file.read()

    # Image load validation
    try:
        image = Image.open(io.BytesIO(image_bytes))
        old_width, old_height = image.size
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Conversion and Analysis
    np_image = np.frombuffer(image_bytes, dtype=np.uint8)

    try:
        compressed_image = return_compressed_image(np_image)
        new_height, new_width, _ = compressed_image.shape

        with io.BytesIO() as buf:
            Image.fromarray(compressed_image).save(buf, format="PNG")
            im_bytes = buf.getvalue()
            encoded_image = base64.b64encode(im_bytes).decode("utf-8")

    except Exception as ex:
        raise HTTPException(
            status_code=500, 
            detail="Something went wrong during image compression: " + str(ex)
        ) from ex
    
    return ResizeAnalysisResponse(
        old_width=old_width,
        old_height=old_height,
        new_width=new_width,
        new_height=new_height,
        image_base64=encoded_image
    )
