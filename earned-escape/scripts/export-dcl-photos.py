"""One-off export: Disney Cruise Fantasy photos → production sizes."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "photos-to-use" / "DisneyCruise_Fantasy"
OUT = ROOT / "public" / "images" / "photos"
ENH = ROOT / "photos-to-use" / "enhanced"

EXPORTS = [
    ("COTIBLumia_20140926_10_27_00_Pro_1024.jpg", "dcl-fantasy-ship-hero.jpg", "hero", 2400, 1350),
    ("COTIBLumia_20140925_11_09_22_Pro__highres_1024.jpg", "dcl-jasmine-meet-story.jpg", "story", 1600, 1200),
    ("IMG_0880.JPG", "dcl-frozen-meet-story.jpg", "story", 1600, 1200),
    ("IMG_5986_1024.jpg", "dcl-port-day-story.jpg", "story", 1600, 1200),
]


def cover_crop(img: Image.Image, tw: int, th: int) -> Image.Image:
    tr = tw / th
    w, h = img.size
    r = w / h
    if r > tr:
        nw = int(h * tr)
        left = (w - nw) // 2
        box = (left, 0, left + nw, h)
    else:
        nh = int(w / tr)
        top = (h - nh) // 2
        box = (0, top, w, top + nh)
    cropped = img.crop(box)
    return cropped.resize((tw, th), Image.Resampling.LANCZOS)


def main() -> None:
    for src_name, out_name, tier, tw, th in EXPORTS:
        src = SRC / src_name
        img = Image.open(src).convert("RGB")
        out = cover_crop(img, tw, th)
        for base in (OUT, ENH / tier):
            base.mkdir(parents=True, exist_ok=True)
            dest = base / out_name
            out.save(dest, "JPEG", quality=88, optimize=True)
            print(f"wrote {dest} ({tw}x{th}) from {src_name}")


if __name__ == "__main__":
    main()