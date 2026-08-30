#!/usr/bin/env python3
"""Build media-manifest.json from assets/photos and assets/music."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PHOTO_DIR = ROOT / "assets" / "photos"
MUSIC_DIR = ROOT / "assets" / "music"
OUTPUT = ROOT / "media-manifest.json"
PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}
MUSIC_EXTENSIONS = {".mp3", ".m4a", ".ogg", ".wav", ".aac"}
DATED_NAME = re.compile(r"^(\d{4}-\d{2}-\d{2})-(.+?)(?:-(\d+))?$")
WHATSAPP_PHOTO = re.compile(
    r"^(?:IMG|VID)-(\d{4})(\d{2})(\d{2})-WA(\d+)$", re.IGNORECASE
)
WHATSAPP_AUDIO = re.compile(
    r"^AUD-(\d{4})(\d{2})(\d{2})-WA(\d+)$", re.IGNORECASE
)

def clean_title(stem):
    """Turn a-file-name into A File Name."""
    if stem.casefold() == "ourlovestory":
        return "Our Love Story"
    stem = re.sub(r"\(\d+k\)$", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"[_-]+", " ", stem)
    stem = re.sub(r"\s+", " ", stem)
    return stem.strip().title()

def extract_photo_details(stem):
    """Understand both preferred names and Android WhatsApp image names."""
    dated = DATED_NAME.match(stem)
    if dated:
        return dated.group(1), clean_title(dated.group(2))

    whatsapp = WHATSAPP_PHOTO.match(stem)
    if whatsapp:
        year, month, day, number = whatsapp.groups()
        return f"{year}-{month}-{day}", f"Our Memory #{number}"

    return "", clean_title(stem)

def photo_record(path):
    date, caption = extract_photo_details(path.stem)
    relative = path.relative_to(ROOT).as_posix()
    thumbnail = ROOT / "assets" / "photos" / "thumbnails" / path.name
    record = {"path": relative, "date": date, "caption": caption, "alt": caption}
    if thumbnail.exists():
        record["thumbnail"] = thumbnail.relative_to(ROOT).as_posix()
    return record

def music_record(path):
    whatsapp = WHATSAPP_AUDIO.match(path.stem)
    if whatsapp:
        year, month, day, number = whatsapp.groups()
        title = f"Our Audio #{number} — {day}/{month}/{year}"
    else:
        title = clean_title(path.stem)
    return {"path": path.relative_to(ROOT).as_posix(), "title": title}

def main():
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)
    MUSIC_DIR.mkdir(parents=True, exist_ok=True)
    photos = [photo_record(path) for path in PHOTO_DIR.rglob("*") if path.is_file() and path.suffix.lower() in PHOTO_EXTENSIONS and "thumbnails" not in path.parts]
    music = [music_record(path) for path in MUSIC_DIR.rglob("*") if path.is_file() and path.suffix.lower() in MUSIC_EXTENSIONS]
    photos.sort(key=lambda item: (not bool(item["date"]), item["date"], item["path"].lower()))
    music.sort(key=lambda item: item["path"].lower())
    OUTPUT.write_text(json.dumps({"photos": photos, "music": music}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Created {OUTPUT.name}: {len(photos)} photos, {len(music)} songs")

if __name__ == "__main__":
    main()
