#!/usr/bin/env bash
# 「以消费方身份 typecheck」冒烟门禁。
#
# 为什么需要这一道：库自己的自查环境比消费方**宽松**，于是「库内 tsc 绿、装出去就挂」
# 这一类问题会成建制地漏网。两处已知的宽松来源：
#   1. packages/ui/tsconfig.json 里 `types: ["vitest/globals"]` 会把 @types/node 顺着
#      vitest 的类型链拉进类型环境 —— 库里任何一处裸 `process` / `Buffer` / `NodeJS.*`
#      在库内都能过，在只跑浏览器的消费方那里却是 TS2580/TS2552（hulianui/hulian#24）。
#   2. monorepo 根 node_modules 里应有尽有，根 barrel 拖进来的依赖总能解析到；
#      装出去以后少一个都会炸（hulianui/hulian#19）。
#
# 因此这里刻意做三件事，缺任何一件这道门禁就是假的：
#   - **走 pnpm pack 产物**而不是 workspace 链接。链接会把 monorepo 的 node_modules
#     暴露给消费方工程，上面两类问题当场被掩盖。
#   - **不装 @types/node**，tsconfig 也不写 types 字段 —— 复刻真实浏览器端消费方的类型环境。
#   - **临时工程建在仓库之外**。tsc 找全局 @types 是从 tsconfig 所在目录**逐级上溯**
#     node_modules/@types，工程一旦落在仓库目录下就会捡到 monorepo 根的 @types/node，
#     门禁形同虚设 —— issue 报告者本机看不到错误正是这个原因。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# CI 传 runner.temp；本地不传就自己开一个系统临时目录。两者都在仓库之外。
WORKDIR="${CONSUMER_SMOKE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/hulian-consumer-XXXXXX")}"

# 断言工程目录确实在仓库之外 —— 这条是整道门禁的地基，宁可直接失败也不要静默失效。
# 刻意放在 mkdir 之前，免得判错时还先在仓库里留下一个脏目录。
case "$WORKDIR/" in
  "$REPO_ROOT"/*) echo "✗ 消费方工程目录 $WORKDIR 落在仓库内，会上溯捡到 monorepo 的 @types/node，门禁失效" >&2; exit 1 ;;
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

# 空白消费方工程：只有 react / react-dom / typescript + 两个 tarball + 库声明的 peer。
# peer 必须装（消费方本来也得装，见 docs/consuming.md），否则失败原因会退化成
# 「找不到模块」，反倒盖住我们真正想抓的类型环境问题。
# 注意这里没有 @types/node —— 那正是被测的变量，别随手加回来。
cat > "$APP_DIR/package.json" <<JSON
{
  "name": "hulian-consumer-smoke",
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
    "tailwindcss": "^4.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "^5.5.0"
  }
}
JSON

# 有意不写 compilerOptions.types：让 tsc 走默认的「自动引入全部可见 @types」，
# 这样一旦 @types/node 从哪条依赖链溜进来，下面的断言能立刻发现。
cat > "$APP_DIR/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "noEmit": true
  },
  "include": ["src"]
}
JSON

# 最小消费面：import 根 barrel 的一个组件即可。因为瑚琏是源码分发 + 根 barrel 全量 re-export，
# 这一行就足以把 barrel 可达的整棵 src 拉进 program —— 库里任何一处不合法的全局引用都会在这里暴露。
# 顺带挂上 ./showcase 子入口：它同样是对外发布的 exports 条目，且能把 *.showcase.tsx 这批
# barrel 不可达的文件也纳入检查，成本为零。
mkdir -p "$APP_DIR/src"
cat > "$APP_DIR/src/app.tsx" <<'TSX'
import { Button } from "@hulianui/ui";
import * as showcase from "@hulianui/ui/showcase";

export function App() {
  return (
    <Button variant="solid" size="md" onClick={() => console.log(Object.keys(showcase).length)}>
      点我
    </Button>
  );
}
TSX

echo "▶ 安装消费方依赖（pnpm · 隔离 node_modules · 无 workspace 链接）"
# --ignore-workspace: 防止 pnpm 沿目录上溯认到别的 workspace。
# --config.auto-install-peers=false: peer 已在上面显式列全，关掉自动装以免悄悄多塞包。
(cd "$APP_DIR" && pnpm install --ignore-workspace --config.auto-install-peers=false --config.strict-peer-dependencies=false >/dev/null)

# 断言 1：@types/node 不得出现在消费方的类型可见范围内。
# 这不是洁癖 —— 它一旦在，process/Buffer 之类就全都合法了，本门禁的检出能力直接归零。
if [ -e "$APP_DIR/node_modules/@types/node" ]; then
  echo "✗ 消费方工程里出现了 @types/node，门禁的检出能力已归零，请查明是哪条依赖链带进来的" >&2
  exit 1
fi

# 断言 2：tokens 的 CSS 入口确实被 pack 进去了（files 字段漏配是发版才发现的典型事故）。
for css in tokens preset primitives semantic; do
  if [ ! -f "$APP_DIR/node_modules/@hulianui/tokens/src/$css.css" ]; then
    echo "✗ @hulianui/tokens 的 $css.css 不在发布产物里（检查 package.json 的 files/exports）" >&2
    exit 1
  fi
done

echo "▶ 以消费方身份 tsc --noEmit"
(cd "$APP_DIR" && ./node_modules/.bin/tsc --noEmit)

# 变量名后紧跟全角括号必须写成 ${VAR}，否则 bash 会把全角字符并进变量名（set -u 下直接报 unbound）。
echo "✓ 消费方 typecheck 通过（${APP_DIR}）"
