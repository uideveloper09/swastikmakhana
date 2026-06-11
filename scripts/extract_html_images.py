import base64
import hashlib
import re
from pathlib import Path

HTML_PATH = Path(r"C:\Users\uidev\Downloads\mithila-makhana.html")
OUT_DIR = Path(__file__).resolve().parents[1] / "frontend" / "public" / "images"

NAMES = [
    "hero",
    "category-1",
    "category-2",
    "category-3",
    "category-4",
    "category-5",
    "category-6",
    "product-1",
    "product-2",
    "product-3",
    "product-4",
    "heritage-main",
    "heritage-accent",
]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    html = HTML_PATH.read_text(encoding="utf-8")
    pattern = re.compile(r"data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)")

    seen: dict[str, str] = {}
    saved: list[tuple[str, str, int]] = []

    for match in pattern.finditer(html):
        ext = "jpg" if match.group(1) == "jpeg" else match.group(1)
        data = base64.b64decode(match.group(2))
        digest = hashlib.md5(data).hexdigest()
        if digest in seen:
            continue
        name = NAMES[len(saved)] if len(saved) < len(NAMES) else f"image-{len(saved) + 1}"
        seen[digest] = name
        out = OUT_DIR / f"{name}.{ext}"
        out.write_bytes(data)
        saved.append((name, f"/images/{name}.{ext}", len(data)))

    for name, path, size in saved:
        print(f"{name}: {path} ({size // 1024} KB)")

    print(f"TOTAL unique images: {len(saved)}")


if __name__ == "__main__":
    main()
