"""Prepare the local CGTrader Earth asset for the live globe proof lab.

Run from the repo root:
  python3 tools/cinematic/prepare_cgtrader_globe.py --asset-dir Globe

The script keeps raw source files private, extracts local textures beside the
source package, creates optimized web texture derivatives, and asks Blender to
export a geometry-only GLB for browser evaluation.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]
PUBLIC_MODELS_DIR = REPO_ROOT / "public" / "cinematic" / "models"
PUBLIC_TEXTURES_DIR = REPO_ROOT / "public" / "cinematic" / "textures"
DOC_PATH = REPO_ROOT / "docs" / "landing" / "cgtrader-live-globe-proof.md"
REPORT_PATH = REPO_ROOT / "docs" / "landing" / "cgtrader-live-globe-asset-report.json"

GLB_OUTPUT = PUBLIC_MODELS_DIR / "cgtrader-earth-live-proof.glb"
WEB_TEXTURES = {
    "day": PUBLIC_TEXTURES_DIR / "cgtrader-earth-day-4k.jpg",
    "night": PUBLIC_TEXTURES_DIR / "cgtrader-earth-night-4k.jpg",
    "clouds": PUBLIC_TEXTURES_DIR / "cgtrader-earth-clouds-4k.jpg",
    "normal": PUBLIC_TEXTURES_DIR / "cgtrader-earth-normal-4k.jpg",
    "specular": PUBLIC_TEXTURES_DIR / "cgtrader-earth-specular-4k.jpg",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--asset-dir", default="Globe", help="Local private CGTrader Earth folder.")
    parser.add_argument("--force", action="store_true", help="Regenerate existing web derivatives.")
    parser.add_argument("--blender-export", action="store_true", help=argparse.SUPPRESS)
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else None)


def find_one(asset_dir: Path, patterns: list[str]) -> Path | None:
    for pattern in patterns:
        matches = sorted(asset_dir.glob(pattern))
        if matches:
            return matches[0]
    return None


def detect_assets(asset_dir: Path) -> dict[str, Path | None]:
    return {
        "blend": find_one(asset_dir, ["*.blend"]),
        "fbx": find_one(asset_dir, ["*optimized*.fbx", "*.fbx"]),
        "obj": find_one(asset_dir, ["*.obj"]),
        "mtl": find_one(asset_dir, ["*.mtl"]),
        "textures_zip": find_one(asset_dir, ["*textures*.zip", "*.zip"]),
    }


def extract_textures(asset_dir: Path, textures_zip: Path | None) -> Path:
    texture_dir = asset_dir / "textures"
    texture_dir.mkdir(parents=True, exist_ok=True)
    if textures_zip and not any(texture_dir.iterdir()):
        with zipfile.ZipFile(textures_zip) as archive:
            archive.extractall(asset_dir)
    return texture_dir


def find_texture(texture_dir: Path, names: list[str]) -> Path | None:
    lowered = {path.name.lower(): path for path in texture_dir.glob("*")}
    for name in names:
        path = lowered.get(name.lower())
        if path:
            return path
    return None


def make_web_texture(source: Path | None, output: Path, force: bool) -> dict[str, Any]:
    if source is None:
        return {"output": str(output.relative_to(REPO_ROOT)), "exists": False, "source": None, "status": "missing-source"}
    if output.exists() and not force:
        return {
            "output": str(output.relative_to(REPO_ROOT)),
            "exists": True,
            "source": str(source.relative_to(REPO_ROOT)),
            "status": "kept-existing",
        }
    output.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["sips", "-s", "format", "jpeg", "-Z", "4096", str(source), "--out", str(output)]
    result = subprocess.run(cmd, cwd=REPO_ROOT, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(f"sips failed for {source}: {result.stderr.strip() or result.stdout.strip()}")
    return {
        "output": str(output.relative_to(REPO_ROOT)),
        "exists": output.exists(),
        "source": str(source.relative_to(REPO_ROOT)),
        "status": "generated",
    }


def run_blender_export(asset_dir: Path, force: bool) -> dict[str, Any]:
    if GLB_OUTPUT.exists() and not force:
        return {"path": str(GLB_OUTPUT.relative_to(REPO_ROOT)), "exists": True, "status": "kept-existing"}
    blender = shutil.which("blender")
    if blender is None:
        return {"path": str(GLB_OUTPUT.relative_to(REPO_ROOT)), "exists": False, "status": "blocked-missing-blender"}
    cmd = [
        blender,
        "--background",
        "--python",
        str(SCRIPT_PATH),
        "--",
        "--blender-export",
        "--asset-dir",
        str(asset_dir),
        *(["--force"] if force else []),
    ]
    result = subprocess.run(cmd, cwd=REPO_ROOT, text=True, capture_output=True)
    return {
        "path": str(GLB_OUTPUT.relative_to(REPO_ROOT)),
        "exists": GLB_OUTPUT.exists(),
        "status": "generated" if result.returncode == 0 and GLB_OUTPUT.exists() else "failed",
        "stdout_tail": result.stdout[-2400:],
        "stderr_tail": result.stderr[-2400:],
    }


def blender_export(asset_dir: Path) -> None:
    import bpy

    assets = detect_assets(asset_dir)
    source = assets["blend"]
    if source:
        bpy.ops.wm.open_mainfile(filepath=str(source))
    elif assets["fbx"]:
        bpy.ops.import_scene.fbx(filepath=str(assets["fbx"]))
    elif assets["obj"]:
        bpy.ops.wm.obj_import(filepath=str(assets["obj"]))
    else:
        raise RuntimeError(f"No .blend, .fbx, or .obj found in {asset_dir}")

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh objects found after loading CGTrader Earth asset")

    earth_meshes = [
        obj
        for obj in meshes
        if "earth" in obj.name.lower() and "atmosphere" not in obj.name.lower() and "cloud" not in obj.name.lower()
    ]
    export_meshes = earth_meshes or meshes

    for obj in bpy.context.scene.objects:
        obj.select_set(obj in export_meshes)
    bpy.context.view_layer.objects.active = export_meshes[0]

    PUBLIC_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    kwargs: dict[str, Any] = {
        "filepath": str(GLB_OUTPUT),
        "export_format": "GLB",
        "use_selection": True,
        "export_apply": True,
    }
    try:
        bpy.ops.export_scene.gltf(**kwargs, export_materials="NONE")
    except TypeError:
        bpy.ops.export_scene.gltf(**kwargs)


def write_doc(asset_dir: Path, report: dict[str, Any]) -> None:
    DOC_PATH.parent.mkdir(parents=True, exist_ok=True)
    detected = report["detected_sources"]
    texture_rows = "\n".join(
        f"- `{value['output']}`: {value['status']} from `{value['source']}`"
        for value in report["web_textures"].values()
    )
    doc = f"""# CGTrader Live Globe Proof

Generated: {datetime.now(timezone.utc).isoformat()}

## Purpose

Step 2A proves that a live CGTrader-derived 3D Earth can render over the approved Step 1 cinematic background. This is not the full waitlist journey.

## Lab Route

- `http://localhost:3000/lab/live-globe-proof`

## Raw Asset Folder

- `{asset_dir.relative_to(REPO_ROOT) if asset_dir.is_relative_to(REPO_ROOT) else asset_dir}`

Raw `.blend`, `.fbx`, `.obj`, `.mtl`, and full-resolution texture files remain outside `/public`.

## Detected Sources

- Blend: `{detected.get("blend")}`
- FBX: `{detected.get("fbx")}`
- OBJ: `{detected.get("obj")}`
- MTL: `{detected.get("mtl")}`
- Textures zip: `{detected.get("textures_zip")}`

## Generated Web-Safe Derivatives

- Model: `{report["glb"]["path"]}` ({report["glb"]["status"]})

{texture_rows}

## Licensing / Safety Notes

- The raw CGTrader package is treated as private/local source material.
- Only optimized lab derivatives are exposed from `/public/cinematic`.
- Production use still needs final licensing approval before launch.

## Scope Check

- Production homepage unchanged.
- Waitlist behavior unchanged.
- No scanner, ticket, ENTER CTA, route arcs, aircraft, or chapter cards in this slice.

## Current Assessment

- Safe for isolated lab evaluation: {"yes" if report["glb"]["exists"] else "blocked until derivative exists"}.
- Next recommended step after approval: Step 2B live route arc system.
"""
    DOC_PATH.write_text(doc, encoding="utf-8")
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")


def main() -> None:
    args = parse_args()
    asset_dir = (REPO_ROOT / args.asset_dir).resolve() if not Path(args.asset_dir).is_absolute() else Path(args.asset_dir)
    if args.blender_export:
        blender_export(asset_dir)
        return

    PUBLIC_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_TEXTURES_DIR.mkdir(parents=True, exist_ok=True)

    assets = detect_assets(asset_dir)
    texture_dir = extract_textures(asset_dir, assets["textures_zip"])
    texture_sources = {
        "day": find_texture(texture_dir, ["8k_earth_daymap.jpg"]),
        "night": find_texture(texture_dir, ["8k_earth_nightmap.jpg"]),
        "clouds": find_texture(texture_dir, ["8k_earth_clouds.jpg"]),
        "normal": find_texture(texture_dir, ["8k_earth_normal_map.tif"]),
        "specular": find_texture(texture_dir, ["8k_earth_specular_map.tif"]),
    }

    web_textures = {
        key: make_web_texture(texture_sources[key], WEB_TEXTURES[key], args.force)
        for key in WEB_TEXTURES
    }
    glb = run_blender_export(asset_dir, args.force)
    report = {
        "asset_dir": str(asset_dir),
        "detected_sources": {key: str(value.relative_to(REPO_ROOT)) if value else None for key, value in assets.items()},
        "web_textures": web_textures,
        "glb": glb,
    }
    write_doc(asset_dir, report)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
