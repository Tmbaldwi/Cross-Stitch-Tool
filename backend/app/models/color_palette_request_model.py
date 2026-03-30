from pydantic import BaseModel

class Color_Palette_Request(BaseModel):
    color_palette: list[str]