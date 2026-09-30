"""Post-process raw Hunyuan3D meshes into web-shippable .glb assets.

Raw output is 1–10 MB per object at ~300k faces, which is useless on a phone.
This pass, per asset:

  1. keeps only the largest connected component (Hunyuan leaves stray shards)
  2. decimates to a face budget sized to how big the item appears on screen
  3. recentres on the origin and scales to a known real-world height, so the
     scene composes from measurements instead of per-item magic numbers
  4. writes Draco-compressed .glb into ../../public/models/

    python optimize_assets.py
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys

import numpy as np
import trimesh

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.normpath(os.path.join(HERE, "..", "..", "public", "models"))

# Per-asset spec.
#
#   size   real-world size of the object's LARGEST dimension, in metres
#   faces  decimation budget, sized by how much identity lives in fine detail
#   rot    optional (x, y, z) degrees applied before normalising
#
# Scaling by the largest extent rather than by height is deliberate: Hunyuan3D
# does not emit a consistent up-axis, so "scale until Y == real height" silently
# mangles any mesh that came out lying on its side. `rot` brings those upright
# first; the measured extents then match the real product.
SPECS: dict[str, dict[str, object]] = {
    "desk-electric": {"size": 1.20, "faces": 6000},
    "desk-mechanical": {"size": 1.20, "faces": 6000},
    "chair-ergonomic": {"size": 1.20, "faces": 90000},
    # Came out lying on its side: its longest axis is X, not Y.
    "chair-gaming": {"size": 1.25, "faces": 90000, "rot": (0, 0, 90)},
    "mon-24-fhd": {"size": 0.54, "faces": 4000},
    "mon-27-4k": {"size": 0.61, "faces": 4000},
    "mon-34-curved": {"size": 0.81, "faces": 5000},
    # Y is the keyboard's depth, Z its thickness — roll it flat.
    "kb-mx-keys": {"size": 0.43, "faces": 60000, "rot": (90, 0, 0)},
    "mouse-mx-master": {"size": 0.126, "faces": 60000},
    "lamp-desk": {"size": 0.45, "faces": 3000},
    "nespresso": {"size": 0.33, "faces": 40000},
}


def largest_component(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    """Hunyuan3D emits floating shards; keep the main body."""
    try:
        parts = mesh.split(only_watertight=False)
    except Exception:  # noqa: BLE001 — needs a graph engine, may be absent
        return mesh
    if len(parts) <= 1:
        return mesh
    biggest = max(parts, key=lambda p: len(p.faces))
    # Only drop the rest if the main body really dominates, otherwise the
    # object is legitimately multi-part (desk = top + two legs).
    if len(biggest.faces) < 0.5 * len(mesh.faces):
        return mesh
    return biggest


def decimate(mesh: trimesh.Trimesh, budget: int) -> trimesh.Trimesh:
    if len(mesh.faces) <= budget:
        return mesh
    try:
        return mesh.simplify_quadric_decimation(face_count=budget)
    except Exception as exc:  # noqa: BLE001
        print(f"      decimation unavailable ({type(exc).__name__}), keeping full res")
        return mesh


def normalise(
    mesh: trimesh.Trimesh,
    target_size: float,
    rot: tuple[float, float, float] | None,
) -> trimesh.Trimesh:
    """Y-up, sitting on y=0, centred in x/z, scaled by its largest dimension."""
    mesh = mesh.copy()

    if rot:
        for axis, degrees in zip(
            ([1, 0, 0], [0, 1, 0], [0, 0, 1]), rot, strict=True
        ):
            if degrees:
                mesh.apply_transform(
                    trimesh.transformations.rotation_matrix(
                        np.radians(degrees), axis
                    )
                )

    longest = float(max(mesh.extents))
    if longest <= 0:
        return mesh
    mesh.apply_scale(target_size / longest)

    bounds = mesh.bounds
    mesh.apply_translation(
        [
            -(bounds[0][0] + bounds[1][0]) / 2,
            -bounds[0][1],
            -(bounds[0][2] + bounds[1][2]) / 2,
        ]
    )
    return mesh


def draco(path: str) -> bool:
    """Compress in place with gltf-transform if it's installed."""
    if shutil.which("npx") is None:
        return False
    tmp = path + ".draco.glb"
    proc = subprocess.run(
        ["npx", "--yes", "@gltf-transform/cli", "optimize", path, tmp,
         "--compress", "draco", "--texture-compress", "webp"],
        capture_output=True,
        text=True,
    )
    if proc.returncode == 0 and os.path.exists(tmp):
        os.replace(tmp, path)
        return True
    print(f"      draco skipped: {proc.stderr.strip()[:160]}")
    if os.path.exists(tmp):
        os.remove(tmp)
    return False


def main() -> int:
    os.makedirs(OUT, exist_ok=True)
    report = {}

    names = sys.argv[1:] or sorted(
        f[:-4] for f in os.listdir(RAW) if f.endswith(".glb")
    )

    for name in names:
        src = os.path.join(RAW, f"{name}.glb")
        if not os.path.exists(src):
            print(f"{name}: no raw mesh, skipping")
            continue
        spec = SPECS.get(name)
        if spec is None:
            print(f"{name}: no spec, skipping")
            continue

        print(f"{name}:")
        scene = trimesh.load(src, force="scene")
        mesh = scene.to_geometry()
        before_faces = len(mesh.faces)
        before_bytes = os.path.getsize(src)

        mesh = largest_component(mesh)
        mesh = decimate(mesh, int(spec["faces"]))  # type: ignore[arg-type]
        mesh = normalise(
            mesh,
            float(spec["size"]),  # type: ignore[arg-type]
            spec.get("rot"),  # type: ignore[arg-type]
        )

        # Flat-ish shading reads better than the noisy raw normals.
        mesh.visual = trimesh.visual.ColorVisuals(
            mesh, vertex_colors=np.tile([228, 230, 228, 255], (len(mesh.vertices), 1))
        )

        dst = os.path.join(OUT, f"{name}.glb")
        mesh.export(dst)
        draco(dst)

        after_bytes = os.path.getsize(dst)
        print(
            f"      {before_faces} -> {len(mesh.faces)} faces, "
            f"{before_bytes / 1_000_000:.1f} MB -> {after_bytes / 1000:.0f} KB, "
            f"height {mesh.extents[1]:.2f} m"
        )
        report[name] = {
            "faces": int(len(mesh.faces)),
            "bytes": int(after_bytes),
            "height": round(float(mesh.extents[1]), 3),
            "extents": [round(float(v), 3) for v in mesh.extents],
        }

    total = sum(r["bytes"] for r in report.values())
    print(f"\n{len(report)} assets, {total / 1_000_000:.2f} MB total")

    # Merge into the existing manifest — this script is routinely run for a
    # single asset, and a plain overwrite would drop every other entry.
    manifest_path = os.path.join(OUT, "manifest.json")
    merged = {}
    if os.path.exists(manifest_path):
        with open(manifest_path) as fh:
            try:
                merged = json.load(fh)
            except json.JSONDecodeError:
                merged = {}
    merged.update(report)
    with open(manifest_path, "w") as fh:
        json.dump(merged, fh, indent=2, sort_keys=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
