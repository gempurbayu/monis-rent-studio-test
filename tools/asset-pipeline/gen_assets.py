"""One-off mock-asset generator for the Monis Studio configurator.

Runs OFFLINE on a dev machine only — it hits the public Hunyuan3D-2 HF Space
to turn monis.rent product photos (and text prompts, where the real catalog has
no photo) into .glb meshes. The app itself ships the resulting files as static
assets; there is no backend and nothing here runs at request time.

    python gen_assets.py            # generate everything missing
    python gen_assets.py chair-lounge mon-27-4k

Output: raw/<id>.glb   (post-process with compress_assets.sh)
"""

from __future__ import annotations

import json
import os
import shutil
import sys
import time
import urllib.request

from gradio_client import Client, handle_file

CDN = "https://strapi.monis.rent/uploads"
RAW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "raw")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src_photos")

# id -> photo filename on the monis.rent CDN, or {"prompt": "..."} when the
# real catalog has no usable single-object shot.
JOBS: dict[str, dict[str, str]] = {
    # ── furniture (the two hero objects) ──
    "desk-electric": {"photo": "desk_titel_new_3db151d44c.jpg"},
    "desk-mechanical": {"photo": "Mechanical_Adjustable_Desk_front_new_a83b8077b0.jpg"},
    "chair-ergonomic": {"photo": "fantech_oca259s_chair_6_b632a0c529.jpg"},
    "chair-gaming": {"photo": "fantech_oca259s_chair_1_97e50244e7.jpg"},
    # ── monitors ──
    "mon-24-fhd": {"photo": "24_Full_HD_Office_Monitor_A24i_1_7f987306af.jpg"},
    "mon-27-4k": {"photo": "27_4_K_A27_U_Multitasking_Monitor_1_ce29d15357.jpg"},
    "mon-34-curved": {"photo": "34_4_K_Gaming_Monitor_7_3f6b2ba627.jpg"},
    # ── desk gear ──
    "kb-mx-keys": {"photo": "Logitech_MX_keys_1_9977480ae1.jpg"},
    "mouse-mx-master": {"photo": "Logitech_S3_6_4cf1e523b8.jpg"},
    "lamp-desk": {"photo": "Xiaomi_Mi_Led_Desk_Lamp_1_S_10_3777ddd163.jpg"},
    # ── comfort / lifestyle ──
    "plant-monstera": {
        "prompt": "a monstera deliciosa houseplant in a terracotta pot, "
        "single object, studio product shot"
    },
    "nespresso": {"photo": "NESPRESSO_Essenza_Mini_2_4ea4cc0abc.jpg"},
}

SPACE = "tencent/Hunyuan3D-2"
PARAMS: dict[str, object] = dict(
    steps=30,
    guidance_scale=5.0,
    seed=1234,
    octree_resolution=256,
    check_box_rembg=True,
    num_chunks=8000,
    randomize_seed=False,
)


def fetch_photo(name: str) -> str:
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        urllib.request.urlretrieve(f"{CDN}/{name}", path)
    return path


def generate(client: Client, job_id: str, spec: dict[str, str]) -> bool:
    out = os.path.join(RAW, f"{job_id}.glb")
    if os.path.exists(out):
        print(f"  {job_id}: cached, skipping")
        return True

    kwargs = dict(PARAMS)
    if "photo" in spec:
        kwargs["image"] = handle_file(fetch_photo(spec["photo"]))
        kwargs["caption"] = None
    else:
        kwargs["image"] = None
        kwargs["caption"] = spec["prompt"]

    t0 = time.time()
    try:
        result = client.predict(api_name="/shape_generation", **kwargs)
    except Exception as exc:  # noqa: BLE001 — the Space fails in many ways
        print(f"  {job_id}: FAILED after {time.time() - t0:.0f}s "
              f"({type(exc).__name__}: {str(exc)[:120]})")
        return False

    src = None
    if isinstance(result, (list, tuple)) and result:
        first = result[0]
        src = first.get("value") if isinstance(first, dict) else first

    if not src or not os.path.exists(src):
        print(f"  {job_id}: no mesh in response")
        return False

    os.makedirs(RAW, exist_ok=True)
    shutil.copy(src, out)
    size = os.path.getsize(out) / 1_000_000
    print(f"  {job_id}: OK {size:.1f} MB in {time.time() - t0:.0f}s")
    return True


def main() -> int:
    wanted = sys.argv[1:] or list(JOBS)
    unknown = [w for w in wanted if w not in JOBS]
    if unknown:
        print("unknown ids:", unknown)
        return 2

    os.makedirs(RAW, exist_ok=True)
    print(f"connecting to {SPACE} …")
    client = Client(SPACE, verbose=False)

    ok, failed = [], []
    for job_id in wanted:
        print(f"[{len(ok) + len(failed) + 1}/{len(wanted)}] {job_id}")
        (ok if generate(client, job_id, JOBS[job_id]) else failed).append(job_id)

    print(f"\ndone: {len(ok)} ok, {len(failed)} failed")
    if failed:
        print("retry with: python gen_assets.py " + " ".join(failed))
    with open(os.path.join(RAW, "_manifest.json"), "w") as fh:
        json.dump({"ok": ok, "failed": failed, "params": PARAMS}, fh, indent=2)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
