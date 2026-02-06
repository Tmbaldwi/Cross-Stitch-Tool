import cv2
import numpy as np

def return_compressed_image_size(npImageArray):
    # get pixel size
    newW, newH = get_pixel_size_fourier_transform_method(npImageArray)

    return newW, newH

def get_pixel_size_fourier_transform_method(npImageArray):
    # Convert image to grayscale
    image = cv2.imdecode(npImageArray, cv2.IMREAD_GRAYSCALE)

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