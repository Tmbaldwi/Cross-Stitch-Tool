from PIL import Image
import numpy as np
from collections import defaultdict

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

            distance_x = abs(x - center_x)
            distance_y = abs(y - center_y)

            # Weight based on distance from center
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