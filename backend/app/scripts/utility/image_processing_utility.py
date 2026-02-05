import os
from PIL import Image
import numpy as np
from typing import Tuple

def convert_image_to_pixel_array(image_path):
    try:
        with Image.open(image_path) as image:
            image = image.convert('RGB')
            pixel_array = np.array(image)

            print(f"Image converted to pixel array")
            return pixel_array
    except Exception as ex:
        print(f"Error converting image to pixel array: {ex}")
        return None
        
def convert_pixel_array_to_image(pixel_array, output_path):
    try:
        pixel_array = np.array(pixel_array, dtype=np.uint8)
        img = Image.fromarray(pixel_array)
        img.save(output_path)
        print(f"Pixel array converted to image")

        return True
    except Exception as ex:
        print(f"Error converting pixel array to image : {ex}")
        return False