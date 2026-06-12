#!/usr/bin/env python3
"""
Remove white backgrounds from original logos, keeping the logo colors intact.
"""

import os
from PIL import Image

SOURCE_DIR = r"I:\My Drive\COTIB_Adventures_LLC\Branding\BasePackage"
DEST_DIR = r"F:\Projects\githubprojects\websites\earned-escape\public\images\logo"

LOGOS = [
    ("ee_profile_logo.png", "ee-profile-logo-original.png"),
]

THRESHOLD = 240

def remove_white_bg(source_path, dest_path, threshold=THRESHOLD):
    """Remove white background, keep original colors."""
    try:
        print(f"Processing: {os.path.basename(source_path)}")

        img = Image.open(source_path).convert("RGBA")
        data = img.getdata()
        new_data = []

        for item in data:
            r, g, b, a = item
            # If pixel is near white, make transparent
            if r > threshold and g > threshold and b > threshold:
                new_data.append((r, g, b, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        img.save(dest_path, "PNG")

        print(f"  [OK] Saved to: {os.path.basename(dest_path)}")
        return True
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def main():
    print("=" * 60)
    print("Remove White Backgrounds (Keep Original Colors)")
    print("=" * 60)

    for source_name, dest_name in LOGOS:
        source_path = os.path.join(SOURCE_DIR, source_name)
        dest_path = os.path.join(DEST_DIR, dest_name)

        if not os.path.isfile(source_path):
            print(f"[NOT FOUND] {source_name}")
            continue

        remove_white_bg(source_path, dest_path)

    print("=" * 60)
    print("[DONE] Logos processed with white backgrounds removed")

if __name__ == "__main__":
    main()
