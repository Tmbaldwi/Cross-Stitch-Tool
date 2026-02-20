from PIL import Image
import numpy as np
from collections import defaultdict


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


def get_median_weighted(full_pixel: np.ndarray) -> np.ndarray:
    """
    full_pixel: numpy array of shape (h, w, 3) in RGB
    Returns: numpy array shape (3,) representing chosen RGB color
    """
    height, width, _ = full_pixel.shape

    color_count = defaultdict(float)
    center_x = width / 2
    center_y = height / 2

    for y in range(height):
        for x in range(width):
            r, g, b = full_pixel[y, x]

            # Manhattan distance from center
            distance_x = abs(x - center_x)
            distance_y = abs(y - center_y)

            # IMPORTANT: use ** not ^
            weight = 1 / (1 + (distance_x + distance_y) ** 2)

            key = (int(r), int(g), int(b))
            color_count[key] += weight

    # Find color with highest weighted count
    best_color = max(color_count.items(), key=lambda item: item[1])[0]

    return np.array(best_color, dtype=np.uint8)


def process_pixel_art(
    image_rgb: np.ndarray,
    new_width: int,
    new_height: int,
    resize_function=get_median_weighted
) -> np.ndarray:
    """
    image_rgb: numpy array (H, W, 3) in RGB
    new_width: target width
    new_height: target height

    Returns downscaled RGB image as numpy array
    """

    original_height, original_width, _ = image_rgb.shape

    # Create destination image
    dst_image = np.zeros((new_height, new_width, 3), dtype=np.uint8)

    x_step = original_width / new_width
    y_step = original_height / new_height

    for y in range(new_height):
        for x in range(new_width):
            src_x = int(np.floor(x * x_step))
            src_y = int(np.floor(y * y_step))

            # Define block region
            x_end = int(np.floor((x + 1) * x_step))
            y_end = int(np.floor((y + 1) * y_step))

            # Prevent overflow
            x_end = min(x_end, original_width)
            y_end = min(y_end, original_height)

            block = image_rgb[src_y:y_end, src_x:x_end]

            if block.size == 0:
                continue

            new_pixel = resize_function(block)

            dst_image[y, x] = new_pixel

    return dst_image