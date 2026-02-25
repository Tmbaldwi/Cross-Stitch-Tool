def process_image_for_color_palette(pixel_array):
    height, width, _ = pixel_array.shape
    unique_colors = []
    colors_seen = set()

    # create list of unique colors from the image
    for col in range(width):
        for row in range(height):
            pixel = pixel_array[row,col]
            color_hex = rgb_to_hex(pixel)
            
            if color_hex not in colors_seen:
                unique_colors.append(color_hex)
                colors_seen.add(color_hex)
    
    print(f"Unique colors found: {len(unique_colors)}")

    return unique_colors


def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def hex_to_rgb(hex):
    hex_color = hex.lstrip('#')

    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)

    return [r,g,b]