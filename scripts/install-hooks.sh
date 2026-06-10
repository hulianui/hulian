#!/bin/sh
# install-hooks.sh — install repo git hooks (.git/hooks is not versioned, run once per clone).
# Usage: sh scripts/install-hooks.sh   (or: pnpm run install-hooks)
set -e

ROOT="$(git rev-parse --show-toplevel)"
HOOK="$ROOT/.git/hooks/post-commit"

cat > "$HOOK" <<'EOF'
#!/bin/sh
# auto-installed by scripts/install-hooks.sh — do not edit here, edit the installer.
# Regenerate ~/.claude/skills/hulianui-index/SKILL.md when ui source or docs manifest changed.
if git diff-tree --no-commit-id --name-only -r HEAD | grep -qE '^(packages/ui/src/|apps/www/lib/manifest\.ts)'; then
  node "$(git rev-parse --show-toplevel)/scripts/gen-skill-index.mjs" || echo "[hulianui-index] skill regen failed (commit unaffected)" >&2
fi
EOF

chmod +x "$HOOK"
echo "installed post-commit hook -> $HOOK"
