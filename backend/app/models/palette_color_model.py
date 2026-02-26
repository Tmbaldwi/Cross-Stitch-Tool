from dataclasses import dataclass
from typing import Tuple

import cv2
import numpy as np
import skimage

@dataclass
class Palette_Color:
    color_hex: str
    color_rgb: Tuple[int, int, int]
    color_lab: Tuple[float, float, float]
    occurences: int

    def __init__(self, rgb: list[int], hex: str, occurences: int):
        self.color_rgb = [int(color) for color in rgb]
        self.color_hex = hex
        self.color_lab = skimage.color.rgb2lab(rgb, illuminant='D65', observer='2', channel_axis=-1)
        self.occurences = occurences
