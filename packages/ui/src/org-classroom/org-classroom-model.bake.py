#!/usr/bin/env python3
"""OrgClassroom asset v5 (= v4 + single tileable desk + lighter meshes).

Fixes over v3:
- Chair is its own complete object (seat, 4 legs, stretchers, back posts, backrest).
  v3 built the back as a side panel and merged chair legs into OC_DeskFrame.
- DeskFrame is two closed side frames + rear cross beam (true U-frame), no voxel remesh.
- Person actually sits: pelvis on seat, feet on floor, thighs under desk, forearms on desktop.
- Contact gaps are measured after remesh and person Z is auto-corrected.
- Colors: Standard view transform, no scarf emission; glTF extras carry hit roles.

Usage (standalone .blend/.glb/preview renders):
  blender -b --factory-startup --python org-classroom-model.bake.py -- <out_dir>
org-classroom-sprites.bake.py imports this file for the build_* functions.
Coordinates: Z-up meters, person faces -Y toward desk. Object names keep the v3 contract.
"""
import bpy
import bmesh
import json
import math
import os
import sys
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(argv[0]) if argv else os.path.abspath("out")
EXPORTS = os.path.join(OUT, "exports")
RENDERS = os.path.join(OUT, "renders")
LOGS = os.path.join(OUT, "logs")
BLEND = os.path.join(EXPORTS, "orgclassroom_person_desk_v5.blend")
GLB = os.path.join(EXPORTS, "orgclassroom_person_desk_v5.glb")
META = os.path.join(EXPORTS, "asset_meta.json")

SEAT = 0.45          # chair seat top
DESK_TOP = 0.75      # desk top surface
DESK_T = 0.035
DESK_D = 0.50
DESK_Y = -0.21 - DESK_D / 2   # near edge stays at y=-0.21
COL_PITCH = 0.60     # side-by-side module; top is 2mm narrower so tiled tops never touch
DESK_W = COL_PITCH - 0.002
ROW_PITCH = 1.15     # recommended front-to-back pitch (desk depth + seat zone + aisle)

LOG_LINES = []


def log(msg):
    print(msg)
    LOG_LINES.append(str(msg))


# ---------------------------------------------------------------- materials
def make_mat(name, color, roughness=0.5, metallic=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    mat.diffuse_color = (*color, 1.0)
    return mat


# ---------------------------------------------------------------- bmesh primitives
def _axis_matrix(p1, p2):
    p1, p2 = Vector(p1), Vector(p2)
    d = p2 - p1
    rot = Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4()
    return Matrix.Translation((p1 + p2) / 2) @ rot, d.length


def bm_capsule(bm, p1, p2, r1, r2=None, seg=20):
    r2 = r1 if r2 is None else r2
    m, length = _axis_matrix(p1, p2)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r1, radius2=r2,
                          depth=length, matrix=m)
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r1,
                              matrix=Matrix.Translation(p1))
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r2,
                              matrix=Matrix.Translation(p2))


def bm_ellipsoid(bm, c, s, seg=24):
    m = Matrix.Translation(c) @ Matrix.Diagonal((*s, 1.0))
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=1.0, matrix=m)


def bm_box(bm, c, dims, rot_x=0.0):
    m = Matrix.Translation(c) @ Matrix.Rotation(rot_x, 4, "X") @ Matrix.Diagonal((*dims, 1.0))
    bmesh.ops.create_cube(bm, size=1.0, matrix=m)


def bm_tube(bm, p1, p2, r, seg=12):
    m, length = _axis_matrix(p1, p2)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r,
                          depth=length, matrix=m)


def obj_from_bm(name, bm):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def apply_mod(ob, mod):
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.selected_objects:
        o.select_set(False)
    ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)


def remesh_smooth(ob, voxel, smooth_iter=6, target_tris=None):
    m = ob.modifiers.new("Remesh", "REMESH")
    m.mode = "VOXEL"
    m.voxel_size = voxel
    apply_mod(ob, m)
    m = ob.modifiers.new("Smooth", "SMOOTH")
    m.factor = 0.5
    m.iterations = smooth_iter
    apply_mod(ob, m)
    if target_tris:
        tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
        if tris > target_tris:
            m = ob.modifiers.new("Decimate", "DECIMATE")
            m.ratio = target_tris / tris
            apply_mod(ob, m)
    for p in ob.data.polygons:
        p.use_smooth = True


def bevel(ob, width, segments=2, angle_deg=40):
    m = ob.modifiers.new("Bevel", "BEVEL")
    m.width = width
    m.segments = segments
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle_deg)
    m.harden_normals = False
    apply_mod(ob, m)


def islands(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    seen, n = set(), 0
    for v in bm.verts:
        if v.index in seen:
            continue
        n += 1
        stack = [v]
        seen.add(v.index)
        while stack:
            cur = stack.pop()
            for e in cur.link_edges:
                o = e.other_vert(cur)
                if o.index not in seen:
                    seen.add(o.index)
                    stack.append(o)
    bm.free()
    return n


# ---------------------------------------------------------------- person
def seg_dist(p, a, b):
    a, b = Vector(a), Vector(b)
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def build_person(mats):
    S = SEAT
    parts = []   # (label, kind, params) for material painting by nearest primitive
    bm = bmesh.new()

    def ell(label, c, s):
        bm_ellipsoid(bm, c, s)
        parts.append((label, "ell", (Vector(c), Vector(s))))

    def cap(label, a, b, r1, r2=None):
        bm_capsule(bm, a, b, r1, r2)
        parts.append((label, "cap", (Vector(a), Vector(b), max(r1, r2 or r1))))

    # pelvis / torso (slight forward lean toward desk)
    ell("pants", (0, 0.06, S + 0.095), (0.16, 0.12, 0.10))
    ell("body", (0, 0.065, S + 0.25), (0.145, 0.105, 0.15))
    ell("body", (0, 0.05, S + 0.43), (0.175, 0.11, 0.16))
    cap("body", (0, 0.045, S + 0.55), (0, 0.035, S + 0.64), 0.045)
    for sx in (-1, 1):
        hip = (sx * 0.085, 0.05, S + 0.075)
        knee = (sx * 0.10, -0.35, S + 0.07)
        ankle = (sx * 0.10, -0.40, 0.085)
        cap("pants", hip, knee, 0.072, 0.062)
        cap("pants", knee, ankle, 0.058, 0.045)
        cap("pants", (sx * 0.10, -0.39, 0.037), (sx * 0.105, -0.52, 0.033), 0.042, 0.036)
        sh = (sx * 0.18, 0.045, S + 0.53)
        elbow = (sx * 0.22, -0.14, DESK_TOP + 0.046)
        wrist = (sx * 0.12, -0.38, DESK_TOP + 0.036)
        cap("body", sh, elbow, 0.05, 0.044)
        cap("body", elbow, wrist, 0.044, 0.036)
        ell("body", (sx * 0.105, -0.425, DESK_TOP + 0.032), (0.038, 0.048, 0.028))

    body = obj_from_bm("OC_Person_Body", bm)
    remesh_smooth(body, voxel=0.011, smooth_iter=6, target_tris=3500)
    body_islands = islands(body)

    body.data.materials.append(mats["pants"])
    body.data.materials.append(mats["body"])

    # Clean straight belt seam: cut the mesh on a plane, pants below / top above.
    belt_z = S + 0.165
    bm = bmesh.new()
    bm.from_mesh(body.data)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, dist=1e-5, plane_co=(0, 0, belt_z), plane_no=(0, 0, 1))
    bm.to_mesh(body.data)
    bm.free()
    for poly in body.data.polygons:
        poly.material_index = 0 if poly.center.z < belt_z else 1
        poly.use_smooth = True

    # head
    bm = bmesh.new()
    bm_ellipsoid(bm, (0, 0.025, S + 0.75), (0.115, 0.11, 0.12), seg=32)
    head = obj_from_bm("OC_Person_Head", bm)
    for p in head.data.polygons:
        p.use_smooth = True
    head.data.materials.append(mats["head"])

    # scarf: neck wrap + one tail draped down the chest front-left
    bm = bmesh.new()
    wrap_c = Vector((0, 0.04, S + 0.585))
    tilt = Matrix.Rotation(math.radians(-12), 4, "X")
    for i in range(48):
        a = 2 * math.pi * i / 48
        off = tilt @ Vector((math.cos(a) * 0.088, math.sin(a) * 0.080, 0))
        bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=6, radius=0.036,
                                  matrix=Matrix.Translation(wrap_c + off))
    ctrl = [Vector(v) for v in ((-0.05, -0.05, S + 0.575), (-0.065, -0.088, S + 0.51),
                                (-0.072, -0.098, S + 0.42), (-0.075, -0.094, S + 0.33))]
    n = 14
    for i in range(n):
        t = i / (n - 1) * (len(ctrl) - 1)
        k = min(int(t), len(ctrl) - 2)
        p = ctrl[k].lerp(ctrl[k + 1], t - k)
        bm_ellipsoid(bm, p, (0.042, 0.016, 0.03), seg=16)
    scarf = obj_from_bm("OC_Person_Scarf", bm)
    remesh_smooth(scarf, voxel=0.008, smooth_iter=4, target_tris=1200)
    scarf_islands = islands(scarf)
    scarf.data.materials.append(mats["scarf"])

    root = bpy.data.objects.new("OC_Person", None)
    root.empty_display_size = 0.15
    bpy.context.collection.objects.link(root)
    for c in (body, head, scarf):
        c.parent = root
    return root, body, head, scarf, body_islands, scarf_islands


# ---------------------------------------------------------------- furniture
def build_desk(mats):
    bm = bmesh.new()
    bm_box(bm, (0, DESK_Y, DESK_TOP - DESK_T / 2), (DESK_W, DESK_D, DESK_T))
    desk = obj_from_bm("OC_Desk", bm)
    bevel(desk, 0.012, segments=3)
    desk.data.materials.append(mats["desk"])

    t = 0.036  # square tube
    y_front, y_back = DESK_Y + DESK_D / 2 - 0.04, DESK_Y - DESK_D / 2 + 0.04
    z_rail = DESK_TOP - DESK_T - t / 2
    bm = bmesh.new()
    for sx in (-1, 1):
        x = sx * (DESK_W / 2 - 0.04)   # whole frame stays inside the desktop footprint
        for y in (y_front, y_back):
            bm_box(bm, (x, y, (z_rail + t / 2) / 2), (t, t, z_rail + t / 2))
        bm_box(bm, (x, DESK_Y, t / 2), (t + 0.008, DESK_D - 0.04, t))          # floor runner
        bm_box(bm, (x, DESK_Y, z_rail), (t, DESK_D - 0.08, t))                # top rail
    bm_box(bm, (0, y_back, 0.62), (DESK_W - 0.08, t * 0.8, t * 0.8))    # rear cross beam
    bm_box(bm, (0, y_back, z_rail), (DESK_W - 0.08, t * 0.8, t * 0.8))  # rear apron
    frame = obj_from_bm("OC_DeskFrame", bm)
    bmesh_dedupe(frame)
    bevel(frame, 0.006, segments=2)
    frame.data.materials.append(mats["frame"])
    return desk, frame


def bmesh_dedupe(ob):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(ob.data)
    bm.free()


def build_chair(mats):
    S = SEAT
    cy = 0.04
    seat_d, seat_w, seat_t = 0.40, 0.42, 0.03
    back_y = cy + seat_d / 2 - 0.01
    shell = bmesh.new()
    bm_box(shell, (0, cy, S - seat_t / 2), (seat_w, seat_d, seat_t))
    tilt = math.radians(-8)  # lean back (top toward +Y)
    bm_box(shell, (0, back_y + 0.025, S + 0.29), (seat_w - 0.02, 0.022, 0.20), rot_x=tilt)
    shell_ob = obj_from_bm("tmp_shell", shell)
    bevel(shell_ob, 0.008, segments=3)

    legs = bmesh.new()
    r = 0.014
    fx, fy0, fy1 = seat_w / 2 - 0.035, cy - seat_d / 2 + 0.035, back_y - 0.015
    z_under = S - seat_t
    for sx in (-1, 1):
        x = sx * fx
        bm_tube(legs, (x, fy0, 0.0), (x, fy0, z_under), r)
        bm_tube(legs, (x, fy1 + 0.02, 0.0), (x, fy1, z_under), r)
        # back post continues up along backrest tilt
        top = Vector((x, back_y + 0.025, S + 0.29)) + Vector((0, math.sin(-tilt), math.cos(tilt))) * 0.07
        bm_tube(legs, (x, fy1, z_under), tuple(top), r)
        bm_tube(legs, (x, fy0, 0.14), (x, fy1 + 0.017, 0.14), r * 0.75)   # side stretcher
    bm_tube(legs, (-fx, fy1 + 0.017, 0.14), (fx, fy1 + 0.017, 0.14), r * 0.75)  # rear stretcher
    legs_ob = obj_from_bm("tmp_legs", legs)
    shell_ob.data.materials.append(mats["chair"])
    legs_ob.data.materials.append(mats["frame"])
    for p in legs_ob.data.polygons:
        p.use_smooth = True

    for o in bpy.context.selected_objects:
        o.select_set(False)
    shell_ob.select_set(True)
    legs_ob.select_set(True)
    bpy.context.view_layer.objects.active = shell_ob
    bpy.ops.object.join()
    chair = bpy.context.view_layer.objects.active
    chair.name = chair.data.name = "OC_Chair"
    return chair


# ---------------------------------------------------------------- checks
def world_bvh(ob, offset=(0, 0, 0)):
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.transform(Matrix.Translation(offset) @ ob.matrix_world)
    t = BVHTree.FromBMesh(bm)
    bm.free()
    return t


def world_verts(ob):
    mw = ob.matrix_world
    return [mw @ v.co for v in ob.data.vertices]


def contact_report(body, chair, desk, frame):
    vs = world_verts(body)
    seat_y0, seat_y1 = 0.04 - 0.20, 0.04 + 0.20
    on_seat = [v.z for v in vs if seat_y0 + 0.02 < v.y < seat_y1 - 0.02 and abs(v.x) < 0.19 and v.z < SEAT + 0.15]
    on_desk = [v.z for v in vs if v.y < DESK_Y + DESK_D / 2 - 0.03 and v.z > DESK_TOP - 0.05]
    feet = [v.z for v in vs if v.y < -0.36 and v.z < 0.2]
    under_desk = [v.z for v in vs if DESK_Y - DESK_D / 2 < v.y < DESK_Y + DESK_D / 2 and v.z < DESK_TOP - 0.05]
    rep = {
        "seat_gap_m": round(min(on_seat) - SEAT, 4),
        "desk_forearm_gap_m": round(min(on_desk) - DESK_TOP, 4) if on_desk else None,
        "foot_floor_gap_m": round(min(feet), 4),
        "thigh_clearance_below_desk_m": round(DESK_TOP - DESK_T - max(under_desk), 4) if under_desk else None,
    }
    b = world_bvh(body)
    rep["overlap_pairs"] = {
        "body_desk": len(b.overlap(world_bvh(desk))),
        "body_frame": len(b.overlap(world_bvh(frame))),
        "body_chair": len(b.overlap(world_bvh(chair))),
    }
    return rep


def tiling_report(meshes):
    """Overlap pairs between one instance and a neighbour at each tiling offset (0 = clean)."""
    base = [world_bvh(o) for o in meshes]
    out = {}
    for name, off in (("right", (COL_PITCH, 0, 0)), ("behind", (0, ROW_PITCH, 0)),
                      ("diag", (COL_PITCH, ROW_PITCH, 0))):
        moved = [world_bvh(o, off) for o in meshes]
        out[name] = sum(len(a.overlap(b)) for a in base for b in moved)
    vs = [v for o in meshes for v in world_verts(o)]
    out["footprint_x"] = [round(min(v.x for v in vs), 3), round(max(v.x for v in vs), 3)]
    out["footprint_y"] = [round(min(v.y for v in vs), 3), round(max(v.y for v in vs), 3)]
    return out


# ---------------------------------------------------------------- scene
def setup_world_and_lights():
    scene = bpy.context.scene
    world = bpy.data.worlds.new("OC_World")
    scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.80, 0.86, 0.92, 1.0)
    bg.inputs["Strength"].default_value = 0.7

    bpy.ops.object.light_add(type="SUN", location=(2, -3, 5))
    sun = bpy.context.active_object
    sun.name = "OC_Sun"
    sun.data.energy = 2.3
    sun.data.angle = math.radians(8)
    sun.rotation_euler = (math.radians(38), math.radians(-18), math.radians(28))

    bpy.ops.object.light_add(type="AREA", location=(-2.5, -1.5, 3.0))
    fill = bpy.context.active_object
    fill.name = "OC_FillLight"
    fill.data.energy = 120
    fill.data.size = 4.0
    fill.rotation_euler = (Vector((0, -0.3, 0.6)) - fill.location).to_track_quat("-Z", "Y").to_euler()


def add_ground(mats):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=6.0)
    g = obj_from_bm("OC_Ground", bm)
    g.data.materials.append(mats["ground"])
    return g


def place_cam(name, loc, target, ortho):
    cd = bpy.data.cameras.new(name)
    cd.type = "ORTHO"
    cd.ortho_scale = ortho
    cam = bpy.data.objects.new(name, cd)
    bpy.context.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return cam


def configure_render():
    sc = bpy.context.scene
    for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
        try:
            sc.render.engine = eng
            break
        except TypeError:
            continue
    sc.render.resolution_x, sc.render.resolution_y = 1280, 960
    sc.render.image_settings.file_format = "PNG"
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    if hasattr(sc.eevee, "taa_render_samples"):
        sc.eevee.taa_render_samples = 64
    if hasattr(sc.eevee, "use_shadows"):
        sc.eevee.use_shadows = True


def render(cam, fname):
    sc = bpy.context.scene
    sc.camera = cam
    sc.render.filepath = os.path.join(RENDERS, fname)
    bpy.ops.render.render(write_still=True)
    log(f"rendered {fname}")
    return f"renders/{fname}"


def tri_count(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


# ---------------------------------------------------------------- main
def main():
    for d in (EXPORTS, RENDERS, LOGS):
        os.makedirs(d, exist_ok=True)
    log(f"Blender {bpy.app.version_string} build_v5")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    mats = {
        "head": make_mat("OC_Mat_Head", (0.045, 0.047, 0.055), 0.55),
        "body": make_mat("OC_Mat_Body", (0.13, 0.14, 0.165), 0.6),
        "pants": make_mat("OC_Mat_Pants", (0.055, 0.06, 0.075), 0.7),
        "scarf": make_mat("OC_Mat_Scarf", (0.10, 0.38, 0.95), 0.55),
        "desk": make_mat("OC_Mat_DeskTop", (0.86, 0.84, 0.80), 0.45),
        "frame": make_mat("OC_Mat_Frame", (0.30, 0.32, 0.36), 0.35, metallic=0.75),
        "chair": make_mat("OC_Mat_Chair", (0.62, 0.65, 0.69), 0.5),
        "ground": make_mat("OC_Mat_Ground", (0.70, 0.77, 0.83), 0.9),
    }
    setup_world_and_lights()
    add_ground(mats)

    person, body, head, scarf, body_isl, scarf_isl = build_person(mats)
    desk, frame = build_desk(mats)
    chair = build_chair(mats)
    furn = bpy.data.objects.new("OC_Furniture", None)
    furn.empty_display_size = 0.12
    bpy.context.collection.objects.link(furn)
    for c in (desk, frame, chair):
        c.parent = furn
    bpy.context.view_layer.update()

    # Auto-correct seat contact: remesh + smooth shrinks the surface slightly.
    pre = contact_report(body, chair, desk, frame)
    log("contact before correction " + json.dumps(pre))
    person.location.z = 0.001 - pre["seat_gap_m"]
    bpy.context.view_layer.update()
    rep = contact_report(body, chair, desk, frame)
    log("contact after correction " + json.dumps(rep))
    tiling = tiling_report([body, head, scarf, desk, frame, chair])
    log("tiling " + json.dumps(tiling))

    # glTF extras: loader hit roles
    person["oc_role"] = "person_root"
    furn["oc_role"] = "furniture_root"
    for o in (body, head, scarf):
        o["oc_hit"] = "person"
    for o in (desk, frame, chair):
        o["oc_hit"] = "furniture"

    target = (0, -0.2, 0.68)
    cams = {
        "isometric": place_cam("OC_Cam_Isometric", (3.2, -3.4, 2.9), target, 2.2),
        "front": place_cam("OC_Cam_Front", (0, -3.7, 0.62), (0, -0.25, 0.62), 2.0),
        "side": place_cam("OC_Cam_Side", (3.7, -0.25, 0.62), (0, -0.25, 0.62), 2.0),
        "back34": place_cam("OC_Cam_Back34", (-2.6, 2.9, 2.4), target, 2.2),
    }
    configure_render()
    paths = {
        "isometric": render(cams["isometric"], "v5_isometric.png"),
        "front": render(cams["front"], "v5_front.png"),
        "side": render(cams["side"], "v5_side.png"),
        "back34": render(cams["back34"], "v5_back34.png"),
    }

    bpy.ops.wm.save_as_mainfile(filepath=BLEND)

    for o in bpy.context.selected_objects:
        o.select_set(False)
    keep = [person, body, head, scarf, furn, desk, frame, chair]
    for o in keep:
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=GLB, export_format="GLB", use_selection=True,
                              export_apply=True, export_yup=True, export_extras=True)

    # Multi-instance preview (render only, not saved): 4 joined desks x 2 rows
    COLS, ROWS = 4, 2
    grid = []
    for r in range(ROWS):
        for c in range(COLS):
            if r == 0 and c == 0:
                continue
            for src in keep:
                d = src.copy()
                bpy.context.collection.objects.link(d)
                grid.append((d, src))
    by_src = {}
    idx = 0
    for r in range(ROWS):
        for c in range(COLS):
            if r == 0 and c == 0:
                continue
            m = {}
            for src in keep:
                d, _ = grid[idx]
                idx += 1
                m[src] = d
            for src, d in m.items():
                if src.parent in m:
                    d.parent = m[src.parent]
            for root in (person, furn):
                m[root].location = root.location + Vector((c * COL_PITCH, r * ROW_PITCH, 0))
    gc = Vector(((COLS - 1) * COL_PITCH / 2, (ROWS - 1) * ROW_PITCH / 2 - 0.2, 0.4))
    bpy.data.objects["OC_Ground"].scale = (2.0, 2.0, 1.0)
    bpy.data.objects["OC_Ground"].location = (gc.x, gc.y, 0)
    grid_cam = place_cam("OC_Cam_Grid", tuple(gc + Vector((4.2, -4.6, 4.0))), tuple(gc), 3.9)
    paths["grid_4x2"] = render(grid_cam, "v5_grid_4x2.png")

    stats = []
    for o in (body, head, scarf, desk, frame, chair):
        stats.append({"name": o.name, "verts": len(o.data.vertices), "tris": tri_count(o),
                      "materials": [m.name for m in o.data.materials],
                      "dimensions": [round(x, 4) for x in o.dimensions],
                      "parent": o.parent.name})
    meta = {
        "version": 5,
        "blender_version": bpy.app.version_string,
        "units": "meters",
        "blend_up_axis": "Z-up",
        "person_forward": "-Y toward desk",
        "glb_export_yup": True,
        "object_contract": {
            "person_root": "OC_Person",
            "person_hit_meshes": ["OC_Person_Body", "OC_Person_Head", "OC_Person_Scarf"],
            "furniture_root": "OC_Furniture",
            "furniture_hit_meshes": ["OC_Desk", "OC_DeskFrame", "OC_Chair"],
            "gltf_extras": {"roots": "oc_role", "meshes": "oc_hit = person | furniture"},
            "preview_only": ["OC_Ground", "OC_Cam_*", "OC_FillLight", "OC_Sun"],
        },
        "key_heights_m": {"seat_top": SEAT, "desk_top": DESK_TOP, "desk_near_edge_y": DESK_Y + DESK_D / 2},
        "person_root_z_correction_m": round(person.location.z, 4),
        "body_mesh_islands": body_isl,
        "scarf_mesh_islands": scarf_isl,
        "contact": rep,
        "tiling": {
            "one_person_per_desk": True,
            "col_pitch_m": COL_PITCH,
            "row_pitch_m_recommended": ROW_PITCH,
            "desk_top_m": [round(DESK_W, 3), DESK_D],
            "how": "place each OC_Person+OC_Furniture pair at (col*col_pitch, row*row_pitch) in Blender XY; "
                   "desks butt side by side with a 2mm seam; row_pitch may grow, not shrink below footprint_y span",
            "neighbour_overlap_pairs": {k: tiling[k] for k in ("right", "behind", "diag")},
            "instance_footprint_x_m": tiling["footprint_x"],
            "instance_footprint_y_m": tiling["footprint_y"],
        },
        "stats": stats,
        "total_tris": sum(s["tris"] for s in stats),
        "file_sizes": {"blend": os.path.getsize(BLEND), "glb": os.path.getsize(GLB)},
        "renders": paths,
    }
    with open(META, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    with open(os.path.join(LOGS, "build_v5.log"), "w", encoding="utf-8") as f:
        f.write("\n".join(LOG_LINES) + "\n")
    log("DONE " + json.dumps({k: meta[k] for k in ("contact", "total_tris", "file_sizes")}))


if __name__ == "__main__":
    main()
