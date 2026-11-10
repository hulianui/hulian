"""Bake OrgClassroom seat sprites into org-classroom-sprites.ts.

Author-side only (Blender + cwebp), never a runtime dependency.

    blender -b --factory-startup --python org-classroom-sprites.bake.py

Why layers instead of one coloured picture: the person follows --color-foreground,
the scarf follows the zone's --zone-accent, furniture follows surface/muted tokens,
and all of them flip in dark mode. So each variant ships
  - shadow : ground contact shadow (black, alpha)
  - shading: the model in plain white under the scene light (multiplied over colour)
  - layers : one alpha mask per colour group, cumulative (layer i = union of groups i..n)
             so neighbouring groups keep anti-aliased edges when painted bottom-up
plus the projection basis, the seat-origin anchor, the head-top point and a convex
hit hull. The runtime projects seats with the same basis, so sprites and maths agree.
"""
import base64
import importlib.util
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile

import bpy
import numpy as np
from mathutils import Vector

sys.dont_write_bytecode = True  # importing the model must not leave __pycache__ in src/
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_TS = os.path.join(HERE, "org-classroom-sprites.ts")

AZIMUTH_DEG = 42.0     # camera swings from -Y (desk front) toward +X
ELEVATION_DEG = 38.0
PX_PER_M = 150         # CSS px per metre at scene scale 1
SUPERSAMPLE = 2        # sprites are stored at 2x for HiDPI
SHADOW_MARGIN_M = 0.18
GROUPS = ["metal", "chair", "desk", "pants", "body", "scarf"]  # paint order, bottom first
MAT_GROUP = {
    "OC_Mat_Frame": "metal",
    "OC_Mat_Chair": "chair",
    "OC_Mat_DeskTop": "desk",
    "OC_Mat_Pants": "pants",
    "OC_Mat_Body": "body",
    "OC_Mat_Head": "body",
    "OC_Mat_Scarf": "scarf",
}

spec = importlib.util.spec_from_file_location("oc_model", os.path.join(HERE, "org-classroom-model.bake.py"))
M = importlib.util.module_from_spec(spec)
spec.loader.exec_module(M)


ROTATIONS = (0, 90, 180, 270)  # seat yaw relative to the camera, counter-clockwise from "facing -Y"


def build(occupied, rot_deg=0):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = {
        "head": M.make_mat("OC_Mat_Head", (1, 1, 1)),
        "body": M.make_mat("OC_Mat_Body", (1, 1, 1)),
        "pants": M.make_mat("OC_Mat_Pants", (1, 1, 1)),
        "scarf": M.make_mat("OC_Mat_Scarf", (1, 1, 1)),
        "desk": M.make_mat("OC_Mat_DeskTop", (1, 1, 1)),
        "frame": M.make_mat("OC_Mat_Frame", (1, 1, 1)),
        "chair": M.make_mat("OC_Mat_Chair", (1, 1, 1)),
        "ground": M.make_mat("OC_Mat_Ground", (1, 1, 1)),
    }
    desk, frame = M.build_desk(mats)
    chair = M.build_chair(mats)
    meshes = [desk, frame, chair]
    head = None
    if occupied:
        person, body, head, scarf, _, _ = M.build_person(mats)
        bpy.context.view_layer.update()
        pre = M.contact_report(body, chair, desk, frame)
        person.location.z = 0.001 - pre["seat_gap_m"]
        bpy.context.view_layer.update()
        meshes += [body, head, scarf]
    # Turn the whole seat about its origin. Only the angle between the seat and the camera
    # changes the picture, so 4 yaws cover every (facing, view) pair at the runtime.
    rig = bpy.data.objects.new("OC_Rig", None)
    bpy.context.collection.objects.link(rig)
    for o in bpy.data.objects:
        if o is not rig and o.parent is None and o.type in {"MESH", "EMPTY"}:
            o.parent = rig
    rig.rotation_euler.z = math.radians(rot_deg)
    bpy.context.view_layer.update()
    bm = __import__("bmesh").new()
    __import__("bmesh").ops.create_grid(bm, x_segments=1, y_segments=1, size=4.0)
    ground = M.obj_from_bm("OC_Ground", bm)
    ground.data.materials.append(mats["ground"])
    return meshes, head, ground


def setup_lights():
    sc = bpy.context.scene
    world = bpy.data.worlds.new("W")
    sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (1, 1, 1, 1)
    bg.inputs["Strength"].default_value = 0.45
    bpy.ops.object.light_add(type="SUN")
    sun = bpy.context.active_object
    sun.data.energy = 2.6
    sun.data.angle = math.radians(24)
    # near-overhead key from camera-left: lit desk tops, darker fronts, and a compact
    # contact shadow that stays inside the seat footprint so tiled seats don't overlap
    sun.rotation_euler = (math.radians(16), math.radians(0), math.radians(-28))


def camera_frame(meshes):
    az, el = math.radians(AZIMUTH_DEG), math.radians(ELEVATION_DEG)
    back = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    cd = bpy.data.cameras.new("C")
    cd.type = "ORTHO"
    cam = bpy.data.objects.new("C", cd)
    bpy.context.collection.objects.link(cam)
    cam.rotation_euler = (-back).to_track_quat("-Z", "Y").to_euler()
    cam.location = back * 10
    bpy.context.view_layer.update()
    mw = cam.matrix_world
    right = Vector(mw.col[0][:3]).normalized()
    up = Vector(mw.col[1][:3]).normalized()

    pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
    xs = [p.x for p in pts]
    ys = [p.y for p in pts]
    for x in (min(xs) - SHADOW_MARGIN_M, max(xs) + SHADOW_MARGIN_M):
        for y in (min(ys) - SHADOW_MARGIN_M, max(ys) + SHADOW_MARGIN_M):
            pts.append(Vector((x, y, 0)))
    a = [right.dot(p) for p in pts]
    b = [up.dot(p) for p in pts]
    ppm = PX_PER_M * SUPERSAMPLE
    res_x = int(math.ceil((max(a) - min(a)) * ppm / 2)) * 2 + 4
    res_y = int(math.ceil((max(b) - min(b)) * ppm / 2)) * 2 + 4
    w_m, h_m = res_x / ppm, res_y / ppm
    a_mid, b_mid = (max(a) + min(a)) / 2, (max(b) + min(b)) / 2
    cam.location = right * a_mid + up * b_mid + back * 10
    cd.ortho_scale = max(w_m, h_m)
    sc = bpy.context.scene
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res_x, res_y
    sc.render.resolution_percentage = 100

    def to_px(p):
        return ((right.dot(p) - (a_mid - w_m / 2)) * ppm, ((b_mid + h_m / 2) - up.dot(p)) * ppm)

    return right, up, back, to_px, res_x, res_y


def configure(samples, denoise):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = denoise
    sc.render.film_transparent = True
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"


def set_material(mat, kind):
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    if kind == "white":
        n = nt.nodes.new("ShaderNodeBsdfPrincipled")
        n.inputs["Base Color"].default_value = (1, 1, 1, 1)
        n.inputs["Roughness"].default_value = 0.65
        nt.links.new(n.outputs[0], out.inputs["Surface"])
    elif kind == "emit":
        n = nt.nodes.new("ShaderNodeEmission")
        n.inputs["Color"].default_value = (1, 1, 1, 1)
        n.inputs["Strength"].default_value = 1.0
        nt.links.new(n.outputs[0], out.inputs["Surface"])
    else:
        n = nt.nodes.new("ShaderNodeHoldout")
        nt.links.new(n.outputs[0], out.inputs["Surface"])


def render_to_array(tmp, name):
    path = os.path.join(tmp, name + ".png")
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(path)
    w, h = img.size
    arr = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    bpy.data.images.remove(img)
    return arr.reshape(h, w, 4)[::-1].copy()  # top row first


def write_png(arr, path):
    h, w, _ = arr.shape
    img = bpy.data.images.new("tmp", w, h, alpha=True)
    img.pixels.foreach_set(np.ascontiguousarray(arr[::-1]).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def to_webp(arr, tmp, name, lossless):
    png = os.path.join(tmp, name + ".png")
    write_png(arr, png)
    webp = os.path.join(tmp, name + ".webp")
    args = ["cwebp", "-quiet", "-mt"]
    args += ["-lossless", "-z", "9", "-exact"] if lossless else ["-q", "80", "-alpha_q", "90", "-m", "6"]
    subprocess.run(args + [png, "-o", webp], check=True)
    data = open(webp, "rb").read()
    return "data:image/webp;base64," + base64.b64encode(data).decode(), len(data)


def convex_hull(points):
    pts = sorted(set(points))
    if len(pts) < 3:
        return pts

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def simplify(poly, keep):
    poly = list(poly)
    while len(poly) > keep:
        best, idx = None, 0
        for i in range(len(poly)):
            a, b, c = poly[i - 1], poly[i], poly[(i + 1) % len(poly)]
            area = abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]))
            if best is None or area < best:
                best, idx = area, i
        poly.pop(idx)
    return poly


def bake_variant(occupied, rot, tmp):
    meshes, head, ground = build(occupied, rot)
    setup_lights()
    right, up, back, to_px, res_x, res_y = camera_frame(meshes)
    tag = f"r{rot}_" + ("occupied" if occupied else "empty")
    mats = [m for m in bpy.data.materials if m.name in MAT_GROUP]
    present = [g for g in GROUPS if any(MAT_GROUP[m.name] == g for m in mats if m.users)]
    sizes = {}

    # shadow: objects cast but are invisible to camera, ground catches
    configure(128, True)
    for o in meshes:
        o.visible_camera = False
    ground.is_shadow_catcher = True
    shadow = render_to_array(tmp, f"{tag}_shadow")
    shadow[..., :3] = 0.0
    shadow[..., 3] = np.clip(shadow[..., 3] * 1.15, 0, 1)
    h2, w2 = shadow.shape[0] // 2, shadow.shape[1] // 2  # soft anyway: store at 1x
    shadow = shadow[: h2 * 2, : w2 * 2].reshape(h2, 2, w2, 2, 4).mean(axis=(1, 3))
    shadow_uri, sizes["shadow"] = to_webp(shadow, tmp, f"{tag}_shadow", lossless=False)
    for o in meshes:
        o.visible_camera = True
    ground.hide_render = True

    # shading: plain white model, normalised so lit tops sit near 1.0
    for m in mats:
        set_material(m, "white")
    shading = render_to_array(tmp, f"{tag}_shading")
    solid = shading[..., 3] > 0.98
    lum = shading[..., :3].mean(axis=2)[solid]
    gain = 0.97 / max(float(np.percentile(lum, 97)), 1e-3)
    shading[..., :3] = np.clip(shading[..., :3] * gain, 0, 1)  # PNG output is straight alpha
    shading_uri, sizes["shading"] = to_webp(shading, tmp, f"{tag}_shading", lossless=False)

    # cumulative colour masks
    configure(32, False)
    layers = []
    union = None
    for i, g in enumerate(present):
        on = set(present[i:])
        for m in mats:
            set_material(m, "emit" if MAT_GROUP[m.name] in on else "holdout")
        arr = render_to_array(tmp, f"{tag}_mask_{g}")
        mask = np.zeros_like(arr)
        mask[..., 3] = arr[..., 3]
        if i == 0:
            union = arr[..., 3].copy()
        uri, sizes[f"mask_{g}"] = to_webp(mask, tmp, f"{tag}_mask_{g}", lossless=True)
        layers.append({"group": g, "mask": uri})

    ys, xs = np.nonzero(union > 0.5)
    edge = []
    for y in np.unique(ys):
        row = xs[ys == y]
        edge += [(int(row.min()), int(y)), (int(row.max()) + 1, int(y) + 1)]
    hull = simplify(convex_hull(edge), 14)
    hull_css = "polygon(" + ", ".join(f"{x / res_x * 100:.2f}% {y / res_y * 100:.2f}%" for x, y in hull) + ")"

    ax, ay = to_px(Vector((0, 0, 0)))
    out = {
        "w": res_x / SUPERSAMPLE,
        "h": res_y / SUPERSAMPLE,
        "anchor": [round(ax / SUPERSAMPLE, 2), round(ay / SUPERSAMPLE, 2)],
        "hull": hull_css,
        "shadow": shadow_uri,
        "shading": shading_uri,
        "layers": layers,
    }
    if head is not None:
        top = max((head.matrix_world @ v.co for v in head.data.vertices), key=lambda p: p.z)
        hx, hy = to_px(top)
        out["head"] = [round(hx / SUPERSAMPLE, 2), round(hy / SUPERSAMPLE, 2)]
    print(f"[{tag}] {res_x}x{res_y} bytes={sizes}")
    basis = {"right": [round(c, 6) for c in right], "up": [round(c, 6) for c in up]}
    return out, basis, sum(sizes.values())


def main():
    if not shutil.which("cwebp"):
        sys.exit("cwebp not found (brew install webp)")
    tmp = tempfile.mkdtemp(prefix="oc-sprites-")
    sprites, basis, total = {}, None, 0
    for rot in ROTATIONS:
        occupied, b_occ, n1 = bake_variant(True, rot, tmp)
        empty, b_emp, n2 = bake_variant(False, rot, tmp)
        assert b_occ == b_emp and (basis is None or basis == b_occ)
        basis = b_occ
        sprites[str(rot)] = {"occupied": occupied, "empty": empty}
        total += n1 + n2
    fp = (M.DESK_W / 2, M.DESK_Y - M.DESK_D / 2)
    data = {
        "projection": {"azimuthDeg": AZIMUTH_DEG, "elevationDeg": ELEVATION_DEG, "pxPerMeter": PX_PER_M, **basis},
        "grid": {
            "colPitch": M.COL_PITCH,
            "rowPitch": M.ROW_PITCH,
            # seat footprint around its origin (chair centre on the floor), metres
            "footprint": {"minX": -0.3, "maxX": 0.3, "minY": round(fp[1], 3), "maxY": 0.28},
        },
    }
    lines = [
        "// 由 org-classroom-sprites.bake.py 生成（Blender + cwebp），不要手改。",
        f"// 4 个相对朝向 × 有人/空座，共 {total / 1024:.1f} KB WebP。重烘：blender -b --factory-startup --python org-classroom-sprites.bake.py",
        "",
        'export type SpriteGroup = "metal" | "chair" | "desk" | "pants" | "body" | "scarf";',
        "",
        "/** 座位相对相机的转角（逆时针，度）。0 = 人面朝 -Y，和默认视角下的「朝下」一致。 */",
        "export type SeatRotation = 0 | 90 | 180 | 270;",
        "",
        "export interface SeatSprite {",
        "  /** CSS px at scene scale 1. */",
        "  w: number;",
        "  h: number;",
        "  /** Pixel where the seat origin (chair centre on the floor) lands. */",
        "  anchor: readonly [number, number];",
        "  /** Pixel of the top of the head; only on the occupied sprite. */",
        "  head?: readonly [number, number];",
        "  /** Convex hit outline as a CSS clip-path. */",
        "  hull: string;",
        "  shadow: string;",
        "  shading: string;",
        "  layers: readonly { group: SpriteGroup; mask: string }[];",
        "}",
        "",
        f"export const ORG_CLASSROOM_PROJECTION = {json.dumps(data['projection'])} as const;",
        "",
        f"export const ORG_CLASSROOM_GRID = {json.dumps(data['grid'])} as const;",
        "",
        "export const ORG_CLASSROOM_SPRITES: Record<SeatRotation, { occupied: SeatSprite; empty: SeatSprite }> = "
        + json.dumps(sprites, indent=2)
        + ";",
        "",
    ]
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"wrote {OUT_TS} ({os.path.getsize(OUT_TS) / 1024:.1f} KB)")
    if os.environ.get("OC_KEEP_TMP"):
        print("kept", tmp)
    else:
        shutil.rmtree(tmp)


main()
