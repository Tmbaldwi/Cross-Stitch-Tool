from dataclasses import dataclass
from typing import Tuple

@dataclass
class Thread:
    dmc_id: str
    name: str
    rgb: Tuple[int, int, int]
    hex_value: str


    def __init__(self, dmc_id: str, name: str, rgb: list[str], hex: str):
        self.dmc_id = dmc_id
        self.name = name
        self.rgb = [int(color) for color in rgb]
        self.hex_value = hex