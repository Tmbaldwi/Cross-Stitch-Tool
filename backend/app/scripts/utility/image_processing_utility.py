import os
from PIL import Image
import numpy as np


# This file is for local testing, should be useless
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

def compress_pixel_array(image_array, pixel_size):
    old_height = image_array.shape[0]
    old_width = image_array.shape[1]

    new_height = old_height // pixel_size
    new_width = old_width // pixel_size

    print("old height: " + str(old_height) + "   | new height: " + str(new_height))
    print("old width: " + str(old_width) + "   | new height: " + str(new_width))

    new_image_array = []

    offset = pixel_size // 2
    
    for row in range(new_height):
        new_image_array.append([])
        for col in range(new_width):
            new_image_array[row].append(image_array[row*pixel_size + offset,col*pixel_size + offset ])

    return new_image_array