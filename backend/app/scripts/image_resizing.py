from pathlib import Path
import cv2
import numpy as np
from PIL import Image
from scripts.utility.image_processing_utility import (
    convert_image_to_pixel_array, 
    convert_pixel_array_to_image
)

BASE_DIR = Path(__file__).resolve().parents[1]  # project-root
test_image_path = BASE_DIR / "test_resources" / "ruinedImage.png"

def compress_image_and_return_pixel_sizes(input_path, output_path):
    # read image and convert to pixel array
    #pixel_array = convert_image_to_pixel_array(input_path)
    input_path = test_image_path

    # get pixel size
    newW, newH = get_pixel_size_fourier_transform_method(input_path)

    oldW, oldH = Image.open(input_path).size

    pixel_array = convert_image_to_pixel_array(input_path)
    new_pixel_array = compress_pixel_array(pixel_array, round(oldW/newW) )
    convert_pixel_array_to_image(new_pixel_array, "output.png")

    # compress image
    # print("Compressing image")
    #compressed_image = compress_pixel_array(pixel_array, pixel_size_options[0][0])

    # convert pixel array back and write image
    #convert_pixel_array_to_image(compressed_image, output_path)

    #return pixel_size_options

def get_pixel_size_fourier_transform_method(input_path):
    # Convert image to grayscale
    image = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)

    # Compute the ImagePeriodogram (place zero-frequency component in the top left)
    image = np.float32(image)
    f_transform = np.fft.fft2(image)
    power_transform = np.abs(f_transform)**2
    power_transform_contrast = np.log1p(power_transform)

    # Extract low frequency region
    w,h = power_transform_contrast.shape
    image_low_freq = power_transform_contrast[:h//4, :w//4]

    # Sum each column and define it as the x dimension array
    # (negate the values as well and remove the zero-frequency part)
    x_dimension = -np.sum(image_low_freq, axis=0)[1:]

    # Sum each row and define it as the y dimension array
    # (negate the values as well and remove the zero-frequency part)
    y_dimension = -np.sum(image_low_freq, axis=1)[1:]

    # Find quadtratic curve for the data, and subtract it from the signal (removes the background)
    x_detrended = remove_smooth_background(x_dimension)
    y_detrended = remove_smooth_background(y_dimension)

    # Find the maximum peak of the background free dimension x and y respectively
    x_max_index = np.argmax(x_detrended) + 1
    y_max_index = np.argmax(y_detrended) + 1

    # Return the new image size
    return x_max_index, y_max_index

def remove_smooth_background(data):
    # Create x array that represents the data curve
    x = np.arange(len(data))

    # Fit a quadratic function that fits our data curve
    coeffs = np.polyfit(x, data, 2)

    # Calculate the values for each x on our polynomial
    trend = np.polyval(coeffs, x)

    # Remove the trend from our data, smoothing it out
    return data - trend

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