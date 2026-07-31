#!/usr/bin/env bash
# 「消费方 bundle 体积」门禁。
#
# 为什么需要这一道：瑚琏是源码分发，仓库里没有 dist/，`du -sh` 量到的 12MB 源码树
# 和消费方真正付出的代价没有任何换算关系 —— 一个组件的真实成本是「把它 import 进去、
# 打包器 tree-shake 完、minify + gzip 之后多出多少字节」。没有这把尺子，任何体积优化
# （懒加载边界、依赖降级、barrel 拆分）都只能凭感觉，也拦不住回归。
#
# 与 consumer-typecheck.sh 同源：都走 pnpm pack 产物、都在仓库之外建空白工程。
# 理由相同 —— workspace 链接会把 monorepo 的 node_modules 暴露给消费方工程，
# 依赖解析一旦走了近路，量出来的体积就不是真实消费方的体积。
#
# 量什么、门禁怎么判，见 scripts/bundle-size.mjs 顶部注释。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# CI 传 runner.temp；本地不传就自己开一个系统临时目录。两者都在仓库之外。
WORKDIR="${BUNDLE_SIZE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/hulian-bundle-size-XXXXXX")}"

# 与 consumer-typecheck.sh 同款地基断言：工程必须在仓库之外。
# 这里的理由不是 @types 上溯，而是 pnpm 会沿目录上溯认到 monorepo 的 workspace，
# 于是 `file:*.tgz` 依赖被悄悄替换成 workspace 链接 —— 门禁量的就成了源码树而非发布产物。
case "$WORKDIR/" in
  "$REPO_ROOT"/*) echo "✗ 体积门禁工程目录 $WORKDIR 落在仓库内，pnpm 会上溯认到 workspace，量出的不是发布产物" >&2; exit 1 ;;
esac

mkdir -p "$WORKDIR"

APP_DIR="$WORKDIR/app"
PKG_DIR="$WORKDIR/packs"
rm -rf "$APP_DIR" "$PKG_DIR"
mkdir -p "$APP_DIR" "$PKG_DIR"

echo "▶ 打包 @hulianui/tokens 与 @hulianui/ui → $PKG_DIR"
(cd "$REPO_ROOT/packages/tokens" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)
(cd "$REPO_ROOT/packages/ui" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)

TOKENS_TGZ="$(ls "$PKG_DIR"/hulianui-tokens-*.tgz)"
UI_TGZ="$(ls "$PKG_DIR"/hulianui-ui-*.tgz)"

# 空白消费方工程。与 consumer-typecheck 的差别：
#   - 不需要 typescript / @types（esbuild 直接吃 tsx，不做类型检查）
#   - 不装 tailwindcss（构建期工具，不进 JS bundle）
#   - 多一个 esbuild —— 它就是本门禁的打包器
# peer 必须装齐：少一个，esbuild 会把它当外部模块跳过，体积凭空少一大块，门禁失真。
# MUI / emotion 四件是 **optional** peer（只有用日期族才需要），不会随 @hulianui/ui 自动装下来，
# 但 size-limits 里有 mui-bridge 这个采样点，所以这里显式装上，模拟「用日期族的消费方」。
# 注意这不代表普通消费方要付这份体积 —— 不用日期族就一个字节都不会拉进来。
cat > "$APP_DIR/package.json" <<JSON
{
  "name": "hulian-bundle-size",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "@hulianui/tokens": "file:$TOKENS_TGZ",
    "@hulianui/ui": "file:$UI_TGZ",
    "@base-ui/react": "^1.5.0",
    "motion": "^12.40.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@mui/material": "^9.2.0",
    "@mui/x-date-pickers": "^9.10.1",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1"
  },
  "devDependencies": {
    "esbuild": "^0.25.0"
  }
}
JSON

echo "▶ 安装消费方依赖（pnpm · 隔离 node_modules · 无 workspace 链接）"
# --ignore-workspace: 防止 pnpm 沿目录上溯认到 monorepo。
# --config.auto-install-peers=false: peer 已在上面显式列全，关掉自动装以免悄悄多塞包
#   —— 多塞的包会被 esbuild 打进去，量出来的体积就不是消费方真实付出的。
(cd "$APP_DIR" && pnpm install --ignore-workspace --config.auto-install-peers=false --config.strict-peer-dependencies=false >/dev/null)

# 断言一：仍在 dependencies 里的重依赖，确实随 @hulianui/ui 装了下来。
# 装不下来说明 pack 产物或 exports 出了问题，继续跑只会量出一个虚低的数字。
#
# 查 .pnpm/ 而不是 node_modules/ 顶层：pnpm 的隔离结构下只有工程自己的直接依赖
# 会出现在顶层，传递依赖一律躺在 .pnpm/ 里（目录名把 `/` 写成 `+`）。
for dep in recharts @tanstack+react-table @vidstack+react @tiptap+react; do
  if ! ls -d "$APP_DIR/node_modules/.pnpm/${dep}@"* >/dev/null 2>&1; then
    echo "✗ ${dep} 没随 @hulianui/ui 装下来，量出的体积会虚低" >&2
    exit 1
  fi
done

# 断言二（方向相反）：MUI / emotion **不得**随 @hulianui/ui 自动装下来。
# 它们是 optional peer，只有上面消费方 package.json 里显式列了才会出现。
# 这条防的是「哪天有人手滑把 @mui/material 挪回 dependencies」—— 那会让每个只想用
# 一个 Button 的项目重新背上整个 MUI + emotion（runtime CSS-in-JS，且不兼容 RSC）。
if node -e "
  const d = require('$REPO_ROOT/packages/ui/package.json');
  const bad = Object.keys(d.dependencies).filter(k => /^@mui\//.test(k) || /^@emotion\//.test(k));
  if (bad.length) { console.error(bad.join(', ')); process.exit(1); }
" 2>/tmp/hulian-mui-dep-check; then
  :
else
  echo "✗ $(cat /tmp/hulian-mui-dep-check) 回到了 dependencies —— 应保持 optional peerDependencies" >&2
  exit 1
fi

echo "▶ esbuild 打包各入口，量 gzip 体积"
# 脚本复制进工程再跑：这样 `import("esbuild")` 走工程自己的 node_modules 正常解析，
# 不必从仓库里跨目录 import 一个绝对路径。
cp "$REPO_ROOT/scripts/bundle-size.mjs" "$APP_DIR/bundle-size.mjs"
cp "$REPO_ROOT/scripts/size-limits.json" "$APP_DIR/size-limits.json"

# 变量名后紧跟全角括号必须写成 ${VAR}，否则 bash 会把全角字符并进变量名（set -u 下直接报 unbound）。
(cd "$APP_DIR" && node bundle-size.mjs "$@")

# --update 时把新基线拷回仓库。
# bundle-size.mjs 写的是它 cwd 下的 size-limits.json —— 那是上面 cp 进临时工程的副本，
# 不拷回来的话临时目录一删就没了，`--update` 等于只把新基线打印到 stdout 让人肉抄。
for arg in "$@"; do
  if [ "$arg" = "--update" ]; then
    cp "$APP_DIR/size-limits.json" "$REPO_ROOT/scripts/size-limits.json"
    echo "▶ 新基线已写回 scripts/size-limits.json"
  fi
done
