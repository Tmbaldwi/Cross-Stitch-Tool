from fastapi import Request
import numpy as np

from app.models.palette_color_model import Palette_Color
from app.scripts.utility.image_processing_utility import hex_to_rgb, rgb_to_hex, rgb_to_int
from skimage.color import rgb2lab

def get_thread_palette_suggestions_for_palette(color_palette: list[str], request_count: int, request: Request) -> list[tuple[str, list[str]]]:
    rgbs = np.array([hex_to_rgb(hex) for hex in color_palette], dtype=np.float64) / 255.0
    lab_array = rgb2lab(rgbs[np.newaxis, :, :])[0]

    return [(hex_color, get_k_closest_threads(lab, request_count, request)) 
            for hex_color, lab in zip(color_palette, lab_array)]

def get_k_closest_threads(lab_array, k: int, request: Request) -> list[str]:
    dists, indices = request.app.state.lab_color_tree.query(lab_array, k=k)
    return [request.app.state.threads[idx].dmc_id for idx in indices]

def generate_color_normalized_image(image_pixel_array):
    # Get color palette and occurrences
    palette = process_image_for_color_palette(image_pixel_array)
    old_color_count = len(palette)

    # Group nearby colors
    grouped_palette_connected = group_nearby_palette_colors_connected(palette=palette, threshold=4)
    new_color_count = len(grouped_palette_connected)

    # Replace grouped colors with singular color
    normalized_image = normalize_image(grouped_palette_connected, image_pixel_array)

    return old_color_count, new_color_count, normalized_image

def normalize_image(grouped_palette: list[list[Palette_Color]], pixel_array):
    color_lookup = get_color_lookup_table(grouped_palette)

    height, width, _ = pixel_array.shape

    pixels = pixel_array.reshape(-1, 3).astype(np.int32)

    # int conversion of hex
    pixel_ints = (pixels[:, 0] << 16) | (pixels[:, 1] << 8) | pixels[:, 2]
    unique_pixel_ints = np.unique(pixel_ints)

    # Convert lookup to int
    compact_lookup = np.zeros(len(unique_pixel_ints), dtype=np.int32)
    for i, pixel_int in enumerate(unique_pixel_ints):
        hex_color = rgb_to_hex([(pixel_int >> 16) & 0xFF, (pixel_int >> 8) & 0xFF, pixel_int & 0xFF])
        compact_lookup[i] = rgb_to_int(color_lookup[hex_color])

    # find our unique pixels in pixel ints w/ binary search
    indices = np.searchsorted(unique_pixel_ints, pixel_ints)
    # pull the replacement ints for every pixel
    replaced_ints = compact_lookup[indices]

    # replace the old pixels with our new pixel replacements
    replaced_pixels = np.stack([
        (replaced_ints >> 16) & 0xFF,
        (replaced_ints >> 8)  & 0xFF,
        replaced_ints        & 0xFF
    ], axis=1).astype(np.uint8)

    return replaced_pixels.reshape(height, width, 3)

# debug testing
def test_efficacy(grouped_palette):
    counts : dict[int, int] = {}
    for color_group in grouped_palette:
        group_size = len(color_group)
        if group_size not in counts:
            counts[group_size] = 1
        else:
            counts[group_size] += 1

    sorted_counts = {key: counts[key] for key in sorted(counts)}

    print(sorted_counts)
    print(len(grouped_palette))

def get_color_lookup_table(color_groups: list[list[Palette_Color]]) -> dict[str, str]:
    # Organlize groups into lookup
    group_lookup: dict[str, str] = {}

    for group in color_groups:
        group_size = len(group)
        total_rgb = (0,0,0)

        for color in group:
            total_rgb = tuple(x + y for x, y in zip(total_rgb, color.color_rgb))
        
        average_rgb = tuple(color_value // group_size for color_value in total_rgb)

        for color in group:
            group_lookup[color.color_hex] = average_rgb

    return group_lookup  

def process_image_for_color_palette(pixel_array) -> dict[str, Palette_Color]:
    pixels = pixel_array.reshape(-1,3)
    unique_rgbs, counts = np.unique(pixels, axis=0, return_counts=True)
    unique_colors: dict[str, Palette_Color] = {}

    print(pixel_array.shape)

    for rgb, count in zip(unique_rgbs, counts):
        hex_color = rgb_to_hex(rgb)
        unique_colors[hex_color] = Palette_Color(rgb=rgb, hex=hex_color, occurences=int(count))
    
    print(f"Unique colors found: {len(unique_colors)}")

    return unique_colors

def group_nearby_palette_colors_connected(palette: dict[str, Palette_Color], threshold) -> list[list[Palette_Color]]:
    hex_colors = list(palette.keys())
    n = len(hex_colors)
    used = set()
    groups : list[list[Palette_Color]] = []

    for i in range(n):
        hex_color = hex_colors[i]

        if hex_color in used:
            continue

        queue = [hex_color]
        used.add(hex_color)
        group = [hex_color]

        while queue:
            current = queue.pop()

            for j in range(i + 1, n):
                hex_color_compare = hex_colors[j]

                if hex_color_compare in used:
                    continue

                # Check if compared color is close to ANY member in the group
                dist = np.linalg.norm(palette[hex_color_compare].color_lab - palette[current].color_lab)
                if dist <= threshold:
                    used.add(hex_color_compare)
                    queue.append(hex_color_compare)
                    group.append(hex_color_compare)

        groups.append([palette[idx] for idx in group])

    return groups