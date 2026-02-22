from app.scripts.utility.image_processing_utility import process_pixel_art
import cv2
import numpy as np

def return_compressed_image(npImageArray : np.ndarray):
    image_bgr : np.ndarray = cv2.imdecode(npImageArray, cv2.IMREAD_COLOR)
    image_rgb : np.ndarray = cv2.cvtColor(image_bgr,cv2.COLOR_BGR2RGB)

    # get old image dimensions
    oldW, oldH, _ = image_rgb.shape
    
    # get new image dimensions
    resized_image_rgb : np.ndarray = image_rgb
    newW, newH = get_pixel_size_fourier_transform_method(resized_image_rgb)

    # try getting new image dimensions until the algorithm agrees
    while newW < oldW and newH < oldH:
        resized_image_rgb = process_pixel_art(image_rgb, newW, newH)
        oldW = newW
        oldH = newH
        newW, newH = get_pixel_size_fourier_transform_method(resized_image_rgb)

    return resized_image_rgb

def get_pixel_size_fourier_transform_method(color_image):
    # Convert image to grayscale
    image = cv2.cvtColor(color_image, cv2.COLOR_RGB2GRAY)

    # Compute the ImagePeriodogram (place zero-frequency component in the top left)
    image = np.float32(image)
    f_transform = np.fft.fft2(image)
    power_transform = np.abs(f_transform)**2
    power_transform_contrast = np.log1p(power_transform)

    # Extract low frequency region
    w,h = power_transform_contrast.shape
    image_low_freq = power_transform_contrast[:h//2, :w//2]

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

    print("-------------------------------------")

    print("proposed", x_max_index, y_max_index)

    oldH, oldW = image.shape

    # if standard deviation is too low, the algorithm is "fishing" for a new size that it doesn't need
    # this covers very small pixel art that is at the appropriate size
    if(np.std(x_detrended) < 40 or np.std(y_detrended) < 40):
        print("std dev rejected")
        return oldW, oldH
    
    pixel_size_w = oldW // x_max_index
    w_accept = oldW / x_max_index - pixel_size_w <= 0.005

    pixel_size_h = oldH // y_max_index
    h_accept = oldH / y_max_index - pixel_size_h <= 0.005

    print(pixel_size_w, w_accept)
    print(pixel_size_h, h_accept)

    # if our difference is significant, test the proposed solution
    if w_accept and h_accept:
        # if both have a reasonable suggestion, take the smaller pixel size (more likely to be correct)
        pixel_size = min(pixel_size_w,pixel_size_h)
        print("both accepted", oldW//pixel_size, oldH//pixel_size)
        return oldW//pixel_size, oldH//pixel_size
    elif w_accept:
        # if only the width is a reasonable suggestion, take it
        print("width accepted only", oldW//pixel_size_w, oldH//pixel_size_w)
        return oldW//pixel_size_w, oldH//pixel_size_w
    elif h_accept:
        # if only the height is a reasonable suggestion, take it
        print("height accepted only", oldW//pixel_size_h, oldH//pixel_size_h)
        return oldW//pixel_size_h, oldH//pixel_size_h
    elif abs(pixel_size_h - pixel_size_w) <= 1:
        # if they are both considered unreasonable, but come to a similar conclusion about the pixel size, take it
        # this covers cases where images are iffy, maybe cropped a little bit on one side or slightly off
        print("same conclusion", x_max_index, y_max_index)
        return x_max_index, y_max_index
    else:
        # if everything else fails, then we don't bother resizing
        print("rejected")
        return oldW, oldH

def remove_smooth_background(data):
    # Create x array that represents the data curve
    x = np.arange(len(data))

    # Fit a quadratic function that fits our data curve
    coeffs = np.polyfit(x, data, 2)

    # Calculate the values for each x on our polynomial
    trend = np.polyval(coeffs, x)

    # Remove the trend from our data, smoothing it out
    return data - trend