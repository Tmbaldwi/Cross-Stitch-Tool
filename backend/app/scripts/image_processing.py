import numpy as np

from app.models.palette_color_model import Palette_Color

def generate_color_normalized_image(image_pixel_array):
    # Get color palette and occurrences
    palette = process_image_for_color_palette(image_pixel_array)
    old_color_count = len(palette)

    # Group nearby colors TODO remove strict one eventually
    print("Strict ===========================")
    grouped_palette_strict = group_nearby_palette_colors_strict(palette=palette, threshold=4)
    
    test_efficacy(grouped_palette=grouped_palette_strict)
    print("Connected ========================")
    grouped_palette_connected = group_nearby_palette_colors_connected(palette=palette, threshold=4)
    new_color_count = len(grouped_palette_connected)
    test_efficacy(grouped_palette=grouped_palette_connected)

    # Replace grouped colors with singular color
    normalized_image = normalize_image(grouped_palette_connected, image_pixel_array)

    return old_color_count, new_color_count, normalized_image

def normalize_image(grouped_palette: dict[str,list[Palette_Color]], pixel_array):
    # TODO implement
    return

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

def process_image_for_color_palette(pixel_array) -> dict[str, Palette_Color]:
    height, width, _ = pixel_array.shape
    print(pixel_array.shape)
    unique_colors: dict[str, Palette_Color] = {}

    # create list of unique colors from the image
    for col in range(width):
        for row in range(height):
            pixel = pixel_array[row,col]
            color_hex = rgb_to_hex(pixel)
            
            if color_hex not in unique_colors.keys():
                unique_colors[color_hex] = Palette_Color(rgb=pixel, hex=color_hex, occurences=1)
            else:
                unique_colors[color_hex].occurences += 1
    
    print(f"Unique colors found: {len(unique_colors)}")

    return unique_colors

def group_nearby_palette_colors_strict(palette: dict[str, Palette_Color], threshold) -> dict[str,list[Palette_Color]]:
    hex_colors = list(palette.keys())
    n = len(hex_colors)
    used = set()
    groups = []

    for i in range(n):
        hex_color = hex_colors[i]
        if hex_color in used:
            continue

        group = [hex_color]
        used.add(hex_color)

        for j in range(i + 1, n):
            hex_color_compare = hex_colors[j]
            if hex_color_compare in used:
                continue

            # Check if j is close to ALL members already in group
            if all(np.linalg.norm(palette[hex_color_compare].color_lab - palette[hex_color_group].color_lab) <= threshold
                   for hex_color_group in group):
                group.append(hex_color_compare)
                used.add(hex_color_compare)

        groups.append([palette[idx] for idx in group])

    return groups

def group_nearby_palette_colors_connected(palette: dict[str, Palette_Color], threshold):
    hex_colors = list(palette.keys())
    n = len(hex_colors)
    used = set()
    groups = []

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


def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def hex_to_rgb(hex):
    hex_color = hex.lstrip('#')

    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    return [r,g,b]