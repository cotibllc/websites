#!/usr/bin/env python3
"""
Invert logo colors and remove white backgrounds for light-on-dark backgrounds.
Converts dark logos to light/white logos suitable for dark purple nav background.
"""

import os
from PIL import Image, ImageOps

# Configuration
SOURCE_DIR = r"I:\My Drive\COTIB_Adventures_LLC\Branding\BasePackage"
DEST_DIR = r"F:\Projects\githubprojects\websites\earned-escape\public\images\logo"

# Logo to invert
LOGO_TO_PROCESS = ("ee_profile_logo.png", "ee-profile-logo-light.png")

# Color threshold for "white" background
THRESHOLD = 240

def invert_and_remove_background(source_path, dest_path, threshold=THRESHOLD):
    """
    Invert logo colors and remove white background for light-on-dark effect.
    Dark text becomes light/white, white background becomes transparent.

    Args:
        source_path: Path to source PNG
        dest_path: Path to save inverted transparent PNG
        threshold: RGB threshold for white background removal
    """
    try:
        print(f"Processing: {os.path.basename(source_path)}")

        # Open image and convert to RGBA
        img = Image.open(source_path).convert("RGBA")

        # Invert the colors (but not the alpha channel)
        # Split into RGBA channels
        r, g, b, a = img.split()

        # Invert RGB channels
        r = ImageOps.invert(r)
        g = ImageOps.invert(g)
        b = ImageOps.invert(b)

        # Merge back with original alpha
        img = Image.merge("RGBA", (r, g, b, a))

        # Now remove the white background (which was originally black after invert)
        data = img.getdata()
        new_data = []

        for item in data:
            r, g, b, a = item

            # If pixel is very light (near white), make it transparent
            if r > threshold and g > threshold and b > threshold:
                new_data.append((r, g, b, 0))  # Make transparent
            else:
                new_data.append(item)  # Keep original

        img.putdata(new_data)

        # Ensure destination directory exists
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)

        # Save as PNG with transparency
        img.save(dest_path, "PNG")

        print(f"  [OK] Saved to: {os.path.basename(dest_path)}")
        return True

    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def main():
    print("=" * 60)
    print("Logo Color Inverter (Dark to Light for Dark Backgrounds)")
    print("=" * 60)

    # Verify source directory exists
    if not os.path.isdir(SOURCE_DIR):
        print(f"❌ Source directory not found: {SOURCE_DIR}")
        return

    source_path = os.path.join(SOURCE_DIR, LOGO_TO_PROCESS[0])
    dest_path = os.path.join(DEST_DIR, LOGO_TO_PROCESS[1])

    # Verify source file exists
    if not os.path.isfile(source_path):
        print(f"❌ File not found: {LOGO_TO_PROCESS[0]}")
        return

    print(f"Source: {source_path}")
    print(f"Destination: {dest_path}")
    print("=" * 60)

    if invert_and_remove_background(source_path, dest_path):
        print("=" * 60)
        print("[SUCCESS] Logo inverted and converted successfully!")
        print(f"Light logo saved to: {LOGO_TO_PROCESS[1]}")
        print("\nNext: Update nav.njk and footer.njk to use the light version")
    else:
        print("[FAILED] Failed to process logo")

if __name__ == "__main__":
    main()
