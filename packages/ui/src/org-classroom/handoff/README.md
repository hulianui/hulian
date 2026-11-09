# OrgClassroom CSS handoff

This is an archive, not an acceptance and not a release. Do not keep tuning the CSS scarf or hip.

The user moved OrgClassroom from this CSS approach to a Blender route. The old CSS scheme did not pass. Blender assets are with the coordinating party, not in this repository. Do not look for them here and do not invent them.

## What this commit is

Parent is `fedea65b662b4ef33581ad494da8649c19c55b67`.

The three product files in this commit are the working tree that was uncommitted on that parent. Their diff against the parent is `wip-a0e3fe0f.patch`, SHA256 `a0e3fe0f50da9868e4a5ce582d406fe4847d0b7e06141a5f17e4f2fec5263e85`. That WIP is kept as source. It is not a passed visual fix.

`fixed-snapshot-0bc399dc.patch` is an earlier snapshot of those same three files. SHA256 `0bc399dc6466362a3883c9eb53812fb0262cd5445f02851ce7ee8488dcfe23f6`. It is not the WIP. The only product difference is the hip crest in `desk.tsx`: the snapshot uses `left-0`, width 78%, height `0.48rem`; the WIP uses `left: -0.12rem`, width 84%, height `0.36rem`. Do not apply one over the other.

## Isolated trials, none accepted

These patches were made in separate worktrees. They are not the committed product tree.

- `experiment-feasibility-scarf-only.patch`: scarf bottom follows the existing hip. Desk, chair, legs, and skew stay as in `fedea65b`. `scarfHipGap` stays negative. Not a pass.
- `experiment-gate-boundary.patch`: skew stays 18°, hip top corners are square, scarf sits just above the high corner. The original layout browser file, unchanged, reported 9 passing tests on that geometry. Unscaled pixels on seat s1 still showed about 9–11px of pure floor at the low end. Automated gates passing is not visual acceptance.

`hip-corners.json` records the screen slope. At 1280 CSS pixels, DPR 1, the hip top corners differ by 7.65px at skew 18°. The two thigh tops differ by 6.33px. Lowering skew makes the screen slope larger. Skew 30, which was measured and not adopted, still leaves 4.28px. Flattening that edge would mean a much larger skew or rotate and would leave the thigh line. That was not done.

`pair-once.json` is the numeric record of the boundary trial above.

Rendered screenshots, `node_modules`, and vitest caches are not in git. They are exported outside the commit as `org-classroom-css-handoff.zip`. That zip is not visual acceptance.
