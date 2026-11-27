import asyncio
import json
import math
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
SCENES_FILE = ROOT / "scenes.json"
AUDIO_DIR = ROOT / "public" / "audio"
TIMELINE_FILE = ROOT / "src" / "timeline.json"


async def synthesize_scene(scene: dict, voice: str, rate: str) -> dict:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    out_path = AUDIO_DIR / f"{scene['id']}.mp3"

    communicate = edge_tts.Communicate(
        text=scene["narration"],
        voice=voice,
        rate=rate,
    )
    await communicate.save(str(out_path))

    audio = MP3(str(out_path))
    duration_sec = round(float(audio.info.length), 2)
    return {
        **scene,
        "audioFile": f"audio/{scene['id']}.mp3",
        "durationSec": duration_sec,
    }


async def main() -> None:
    config = json.loads(SCENES_FILE.read_text(encoding="utf-8"))
    voice = config.get("voice", "es-CO-GonzaloNeural")
    rate = config.get("rate", "+5%")
    fps = int(config.get("fps", 30))

    print(f"Generando narracion con voz {voice} ({rate})...")
    timeline_scenes = []
    cursor_frame = 0

    for scene in config["scenes"]:
        item = await synthesize_scene(scene, voice, rate)
        # Margen de respiracion de 0.7s entre escenas
        pad_sec = 0.9 if scene["type"] in ("hero", "outro") else 0.7
        duration_frames = math.ceil((item["durationSec"] + pad_sec) * fps)
        item["startFrame"] = cursor_frame
        item["durationFrames"] = duration_frames
        if scene["type"] == "demo":
            item["clipFile"] = f"clips/{scene['id']}.webm"
        cursor_frame += duration_frames
        timeline_scenes.append(item)
        print(
            f"  [OK] {scene['id']}: {item['durationSec']:.2f}s "
            f"({duration_frames} frames)"
        )

    total_sec = round(cursor_frame / fps, 2)
    TIMELINE_FILE.parent.mkdir(parents=True, exist_ok=True)
    TIMELINE_FILE.write_text(
        json.dumps(
            {
                "fps": fps,
                "totalFrames": cursor_frame,
                "totalDurationSec": total_sec,
                "scenes": timeline_scenes,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    print(f"\nTimeline listo: {total_sec:.1f}s ({total_sec/60:.2f} min) -> {TIMELINE_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
