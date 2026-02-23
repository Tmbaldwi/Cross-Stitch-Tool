from dataclasses import dataclass
from typing import Tuple

@dataclass
class Thread:
    id: str
    name: str
    rgb: Tuple[int, int, int]
    hex_value: str


    def __init__(self, id: str, name: str, red: int, green: int, blue: int, hex: str):
        self.id = id
        self.name = name
        self.rgb = (int(red), int(green), int(blue))
        self.hex_value = hex