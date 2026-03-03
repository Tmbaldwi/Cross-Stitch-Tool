import io
from fastapi import APIRouter, File, HTTPException, Response, UploadFile
import numpy as np
from PIL import Image
from app.scripts.image_resizing import return_compressed_image
from app.scripts.image_processing import generate_color_normalized_image

router = APIRouter(
    prefix="/image",
    tags=["Image"]
)

@router.post("/rescale-image", summary= "Analyzes the provided image and returns a (potentially) compressed image along with dimensional changes.")
async def rescale_image(image_file: UploadFile = File(...)):
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

    # Convert and rescale Image
    np_image = np.frombuffer(image_bytes, dtype=np.uint8)

    try:
        compressed_image = return_compressed_image(np_image)

        with io.BytesIO() as buf:
            Image.fromarray(compressed_image).save(buf, format="PNG")
            compressed_image_bytes = buf.getvalue()
    except Exception as ex:
        raise HTTPException(
            status_code=500, 
            detail="Something went wrong during image compression: " + str(ex)
        ) from ex
    
    headers = {
        "old-width": str(old_width),
        "old-height": str(old_height)
    }
    
    return Response(
        content=compressed_image_bytes,
        media_type="image/png",
        headers=headers
    )

@router.post("/color-normalize-image")
async def color_normalize_image(image_file: UploadFile = File(...)):
    # Image type validation
    if not image_file.content_type or not image_file.content_type.startswith("image/png"):
        raise HTTPException(status_code=400, detail="File must be 'png' type")

    image_bytes = await image_file.read()

    # Image load validation
    try:
        image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Convert and normalize image
    image = image.convert("RGB")
    pixel_array = np.array(image)

    try:
        old_color_count, new_color_count, color_normalize_image = generate_color_normalized_image(pixel_array)

        with io.BytesIO() as buf:
            Image.fromarray(color_normalize_image).save(buf, format="PNG")
            compressed_image_bytes = buf.getvalue()
    except Exception as ex:
        raise HTTPException(
            status_code=500, 
            detail="Something went wrong during image compression: " + str(ex)
        ) from ex
    
    headers = {
        "old-color-count": str(old_color_count),
        "new-color-count": str(new_color_count)
    }
    
    return Response(
        content=compressed_image_bytes,
        media_type="image/png",
        headers=headers
    )