#!/usr/bin/env python3
"""
Remove white/light backgrounds from logo PNGs and save as transparent PNGs.
Converts logos from Google Drive branding folder to website public/images/logo/
"""

import os
import sys
from PIL import Image
import shutil

# Configuration
SOURCE_DIR = r"I:\My Drive\COTIB_Adventures_LLC\Branding\BasePackage"
DEST_DIR = r"F:\Projects\githubprojects\websites\earned-escape\public\images\logo"

# Logo files to process
LOGOS = [
    ("ee_about_logo.png", "ee-about-logo.png"),
    ("ee_book_now_logo.png", "ee-book-now-logo.png"),
    ("ee_disney_logo.png", "ee-disney-logo.png"),
    ("ee_facebook_banner_logo.png", "ee-facebook-banner-logo.png"),
    ("ee_profile_logo.png", "ee-profile-logo.png"),
    ("ee_royal_caribbean_logo.png", "ee-royal-caribbean-logo.png"),
    ("ee_tiktok_banner_logo.png", "ee-tiktok-banner-logo.png"),
]

# Color threshold for "white" or "light background"
# Pixels with RGB values above this threshold will be made transparent
# Adjust if needed: lower = more aggressive removal, higher = less aggressive
THRESHOLD = 240

def remove_background(source_path, dest_path, threshold=THRESHOLD):
    """
    Open image, convert light pixels to transparent, save as PNG.

    Args:
        source_path: Path to source PNG
        dest_path: Path to save transparent PNG
        threshold: RGB threshold (0-255). Pixels with all channels > threshold become transparent.
    """
    try:
        print(f"Processing: {os.path.basename(source_path)}")

        # Open image and convert to RGBA (with alpha channel)
        img = Image.open(source_path).convert("RGBA")

        # Get image data
        data = img.getdata()

        # Create new image data with transparency
        new_data = []
        for item in data:
            # item is (R, G, B, A) tuple
            r, g, b, a = item

            # If pixel is very light (near white), make it transparent
            if r > threshold and g > threshold and b > threshold:
                new_data.append((r, g, b, 0))  # Make transparent
            else:
                new_data.append(item)  # Keep original

        # Apply new data to image
        img.putdata(new_data)

        # Ensure destination directory exists
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)

        # Save as PNG with transparency
        img.save(dest_path, "PNG")

        print(f"  ✓ Saved to: {os.path.basename(dest_path)}")
        return True

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("Earned Escape Logo Background Remover")
    print("=" * 60)

    # Verify source directory exists
    if not os.path.isdir(SOURCE_DIR):
        print(f"❌ Source directory not found: {SOURCE_DIR}")
        sys.exit(1)

    print(f"Source: {SOURCE_DIR}")
    print(f"Destination: {DEST_DIR}")
    print(f"Threshold: {THRESHOLD} (0-255, higher = less aggressive)")
    print("=" * 60)

    success_count = 0
    fail_count = 0

    for source_name, dest_name in LOGOS:
        source_path = os.path.join(SOURCE_DIR, source_name)
        dest_path = os.path.join(DEST_DIR, dest_name)

        # Verify source file exists
        if not os.path.isfile(source_path):
            print(f"⚠ File not found: {source_name}")
            fail_count += 1
            continue

        # Remove background
        if remove_background(source_path, dest_path):
            success_count += 1
        else:
            fail_count += 1

    print("=" * 60)
    print(f"✓ Success: {success_count}")
    print(f"✗ Failed: {fail_count}")
    print("=" * 60)

    if fail_count == 0:
        print("✓ All logos processed successfully!")
        print(f"\nLogos saved to: {DEST_DIR}")
    else:
        print(f"⚠ {fail_count} logo(s) failed. Check errors above.")

if __name__ == "__main__":
    main()
