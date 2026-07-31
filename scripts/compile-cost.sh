#!/usr/bin/env bash
# 「消费方编译压力」尺子 —— 量 dev 模块图规模、transform 耗时、峰值内存。
#
# 与 bundle-size.sh 是两把不同的尺子，别混：
#   - bundle-size 量**下载压力**（用户的字节），跑 prod bundle + tree-shaking。
#   - 本脚本量**编译压力**（开发者的内存和 CPU），跑 dev 路径、**不做 tree-shaking**。
#
# 两者会给出相反的结论，这恰恰是它存在的理由：Video 的产物是 Button 的 6 倍字节，
# 模块数却只有它的十分之一（vidstack 发预打包 dist，motion 发细碎 ESM）。
# 只看字节会以为 Button 很便宜，而 dev server 的内存是按模块数吃的。
#
# 建工程的流程与 consumer-typecheck.sh / bundle-size.sh 同源（pack 产物 + 仓库外空白工程），
# 刻意各写一份而不抽公共库：三者的依赖集不同（tsc / esbuild / vite），
# 且任何一把尺子的搭建方式出问题时，不该连累另外两把。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="${COMPILE_COST_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/hulian-compile-cost-XXXXXX")}"

# 工程必须在仓库之外：否则 pnpm 上溯认到 monorepo workspace，
# `file:*.tgz` 被换成源码软链，量的就不是发布产物了。
case "$WORKDIR/" in
  "$REPO_ROOT"/*) echo "✗ 工程目录 $WORKDIR 落在仓库内，pnpm 会上溯认到 workspace" >&2; exit 1 ;;
esac

mkdir -p "$WORKDIR"
APP_DIR="$WORKDIR/app"
PKG_DIR="$WORKDIR/packs"
rm -rf "$APP_DIR" "$PKG_DIR"
mkdir -p "$APP_DIR/src" "$PKG_DIR"

echo "▶ 打包 @hulianui/tokens 与 @hulianui/ui → $PKG_DIR"
(cd "$REPO_ROOT/packages/tokens" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)
(cd "$REPO_ROOT/packages/ui" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)

TOKENS_TGZ="$(ls "$PKG_DIR"/hulianui-tokens-*.tgz)"
UI_TGZ="$(ls "$PKG_DIR"/hulianui-ui-*.tgz)"

cat > "$APP_DIR/package.json" <<JSON
{
  "name": "hulian-compile-cost",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@hulianui/tokens": "file:$TOKENS_TGZ",
    "@hulianui/ui": "file:$UI_TGZ",
    "@base-ui/react": "^1.5.0",
    "motion": "^12.40.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "@vitejs/plugin-react": "^4.7.0",
    "typescript": "^5.5.0",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0"
  }
}
JSON

echo "▶ 安装消费方依赖"
(cd "$APP_DIR" && pnpm install --ignore-workspace --config.auto-install-peers=false --config.strict-peer-dependencies=false >/dev/null)

cp "$REPO_ROOT/scripts/compile-cost.mjs" "$APP_DIR/compile-cost.mjs"

# 变量名后紧跟全角括号必须写成 ${VAR}，否则 bash 会把全角字符并进变量名（set -u 下直接报 unbound）。
echo "▶ 起 Vite dev server，逐场景量模块图与内存"
(cd "$APP_DIR" && node --expose-gc compile-cost.mjs "$@")
