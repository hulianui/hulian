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
#
# 消费方工程只装库声明的 peer（react / react-dom / @base-ui/react / motion / tailwindcss），
# **一个可选依赖都不装** —— 0.15.0 起 @hulianui/ui 没有 optional peer 了，日期族自研为零依赖
# 并回到根 barrel。因此「根 barrel 拉进来的东西是不是都装得上」这件事，这一个场景就能全证。
# 顺带钉死一条回归：日期族必须能从根 barrel 导入（见下面 app.tsx 里的 DatePicker 等），
# 谁要是再把它们挪去子路径、或引入需要额外安装的依赖，这里当场 TS2307。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 消费方装哪个 TypeScript。**这个版本与仓库自己用的 tsc 无关**，两者服务不同目的：
# 仓库的 tsc 检查我们自己的代码，这里的 tsc 模拟下游。瑚琏是源码分发，下游用自己的
# tsc 编译我们的 .tsx，所以「支持哪些 TS 版本」这件事只有这道门禁能证明。
CONSUMER_TS_VERSION="${CONSUMER_TS_VERSION:-^7.0.2}"

# CI 传 runner.temp；本地不传就自己开一个系统临时目录。两者都在仓库之外。
WORKDIR="${CONSUMER_SMOKE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/hulian-consumer-XXXXXX")}"

# 断言工程目录确实在仓库之外 —— 这条是整道门禁的地基，宁可直接失败也不要静默失效。
# 刻意放在 mkdir 之前，免得判错时还先在仓库里留下一个脏目录。
case "$WORKDIR/" in
  "$REPO_ROOT"/*) echo "✗ 消费方工程目录 $WORKDIR 落在仓库内，会上溯捡到 monorepo 的 @types/node，门禁失效" >&2; exit 1 ;;
esac

mkdir -p "$WORKDIR"

PKG_DIR="$WORKDIR/packs"
rm -rf "$PKG_DIR"
mkdir -p "$PKG_DIR"

echo "▶ 打包 @hulianui/tokens 与 @hulianui/ui → $PKG_DIR"
(cd "$REPO_ROOT/packages/tokens" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)
(cd "$REPO_ROOT/packages/ui" && pnpm pack --pack-destination "$PKG_DIR" >/dev/null)

TOKENS_TGZ="$(ls "$PKG_DIR"/hulianui-tokens-*.tgz)"
UI_TGZ="$(ls "$PKG_DIR"/hulianui-ui-*.tgz)"

# 有意不写 compilerOptions.types —— 但两代 tsc 下这个「不写」的含义**不同**，别按旧理解读：
#   - TS ≤6：默认自动引入全部可见的 @types。于是 @types/node 一旦从某条依赖链溜进来，
#     process/Buffer 立刻全部合法，本门禁的检出能力当场归零 —— 下面的断言 1 就是为此设的。
#   - TS 7：`types` 默认值改成了 `[]`，不再自动引入任何 @types（实测：装了 @types/node
#     且不写 types 字段，`process` 仍报 TS2591）。检出能力不再依赖「消费方目录里没有
#     @types/node」这个前提。
# 所以断言 1 在 TS7 下从「地基」降级为「兜底」：它现在拦的是依赖树被污染这件事本身，
# 而不再是门禁失效的唯一防线。**两代下都保留它**，因为 CONSUMER_TS_VERSION 可切回 5.x。
write_tsconfig() {
  cat > "$1/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    // 刻意比库更严一档：消费方开这类「不在 strict 家族、需单独开」的检查是常态，
    // 而 skipLibCheck 只跳 .d.ts、跳不过我们发出去的 .tsx 源码 —— 库里少一个
    // override 修饰符就是消费方的 TS4114 硬失败（hulianui/hulian#31）。
    // 同步在 tsconfig.base.json 也开了，这里是发布产物侧的兜底。
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "noEmit": true
  },
  "include": ["src"]
}
JSON
}

# install + 两条环境断言 + tsc。两个场景共用，避免任一场景少跑一条断言。
install_and_typecheck() {
  local app_dir="$1" label="$2"

  echo "▶ [$label] 安装消费方依赖（pnpm · 隔离 node_modules · 无 workspace 链接 · typescript ${CONSUMER_TS_VERSION}）"
  # --ignore-workspace: 防止 pnpm 沿目录上溯认到别的 workspace。
  # --config.auto-install-peers=false: peer 已在上面显式列全，关掉自动装以免悄悄多塞包。
  (cd "$app_dir" && pnpm install --ignore-workspace --config.auto-install-peers=false --config.strict-peer-dependencies=false >/dev/null)

  # 断言 1：@types/node 不得出现在消费方的类型可见范围内。
  # 这不是洁癖 —— 它一旦在，process/Buffer 之类就全都合法了，本门禁的检出能力直接归零。
  if [ -e "$app_dir/node_modules/@types/node" ]; then
    echo "✗ [$label] 消费方工程里出现了 @types/node，门禁的检出能力已归零，请查明是哪条依赖链带进来的" >&2
    exit 1
  fi

  # 断言 2：tokens 的 CSS 入口确实被 pack 进去了（files 字段漏配是发版才发现的典型事故）。
  for css in tokens preset primitives semantic; do
    if [ ! -f "$app_dir/node_modules/@hulianui/tokens/src/$css.css" ]; then
      echo "✗ [$label] @hulianui/tokens 的 $css.css 不在发布产物里（检查 package.json 的 files/exports）" >&2
      exit 1
    fi
  done

  echo "▶ [$label] 以消费方身份 tsc --noEmit"
  (cd "$app_dir" && ./node_modules/.bin/tsc --noEmit)
  # 变量名后紧跟全角括号必须写成 ${VAR}，否则 bash 会把全角字符并进变量名（set -u 下直接报 unbound）。
  echo "✓ [$label] 消费方 typecheck 通过（${app_dir}）"
}

# 空白消费方工程：只有 react / react-dom / typescript + 两个 tarball + 库声明的 peer。
# peer 必须装（消费方本来也得装，见 docs/consuming.md），否则失败原因会退化成
# 「找不到模块」，反倒盖住我们真正想抓的类型环境问题。
# 注意这里没有 @types/node —— 那正是被测的变量，别随手加回来。
APP_A="$WORKDIR/app-baseline"
rm -rf "$APP_A"
mkdir -p "$APP_A/src"
cat > "$APP_A/package.json" <<JSON
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
    "typescript": "$CONSUMER_TS_VERSION",
    "vitest": "^3.2.7"
  }
}
JSON
write_tsconfig "$APP_A"

# 最小消费面：import 根 barrel 的一个组件即可。因为瑚琏是源码分发 + 根 barrel 全量 re-export，
# 这一行就足以把 barrel 可达的整棵 src 拉进 program —— 库里任何一处不合法的全局引用都会在这里暴露。
# 顺带挂上 ./showcase 子入口：它同样是对外发布的 exports 条目，且能把 *.showcase.tsx 这批
# barrel 不可达的文件也纳入检查，成本为零。
#
# 另外挂几条 `./*` 子路径导出（hulianui/hulian#19）：这批入口只在真实 exports 解析下才成立，
# 库内 tsc 走相对路径、workspace 链接走目录直读，两者都**测不到** exports 映射写错。
# 取样刻意覆盖三类：普通组件目录、没有 index.ts 需专门补的基础设施目录（theme/lib）。
cat > "$APP_A/src/app.tsx" <<'TSX'
import { Button, Calendar, DatePicker, DateTimePicker, TimeField } from "@hulianui/ui";
import * as showcase from "@hulianui/ui/showcase";
import { Tag } from "@hulianui/ui/tag";
import { ThemeProvider } from "@hulianui/ui/theme";
import { cn } from "@hulianui/ui/lib";

export function App() {
  return (
    <ThemeProvider>
      <Tag className={cn("mr-2")}>标签</Tag>
      {/* 日期族：0.15.0 起自研零依赖并回到根 barrel。列在这里是为了钉死回归 ——
          谁再把它们挪去子路径、或让它们依赖需要另外安装的包，这个工程当场编不过。 */}
      <Calendar defaultValue="2026-06-08" />
      <DatePicker defaultValue="2026-06-08" aria-label="日期" />
      <DateTimePicker defaultValue="2026-06-08 09:30" aria-label="日期时间" />
      <TimeField defaultValue="09:30" />
      <Button variant="solid" size="md" onClick={() => console.log(Object.keys(showcase).length)}>
        点我
      </Button>
    </ThemeProvider>
  );
}
TSX

# 工具入口（./vite、./vitest-preset）单独引一次：它们不在组件树上，上面那份 app.tsx 无论
# 怎么写都覆盖不到，于是「exports 条目缺 types 字段」这类问题在库内 tsc 和这道门禁下都不报错，
# 只在消费方 tsc 时炸成 TS7016 —— 0.15.0 的 vitest-preset 就是这么逃出去的（hulianui/hulian#35）。
# 消费方的 vitest.config.ts 通常也在 tsconfig 的 include 里，所以这里等价复现那条链路。
cat > "$APP_A/src/tooling.ts" <<'TS'
import { hulian } from "@hulianui/ui/vite";
import {
  withHulian,
  hulianDedupe,
  hulianConditions,
  hulianMainFields,
  hulianInlineDeps,
} from "@hulianui/ui/vitest-preset";

export const vitePlugin = hulian({ prebundle: false });
export const vitestConfig = withHulian({ test: { environment: "jsdom" } });
export const presetLists = [
  hulianDedupe,
  hulianConditions,
  hulianMainFields,
  hulianInlineDeps,
] as const;
TS

install_and_typecheck "$APP_A" "消费方"
