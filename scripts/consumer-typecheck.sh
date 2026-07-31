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
# 跑两个互斥的消费方场景（**必须是两个隔离工程，不能合并**）：
#   A. baseline —— 不装 MUI/emotion。这是绝大多数消费方的样子，也是「根 barrel 不得
#      可达 @mui/*」这条契约的唯一证明：一旦有人把日期族挪回根 barrel 或把 MUI 从
#      optional peer 改回 dependency，这一场景当场 TS2307。
#   B. date-pickers —— 装上 MUI/emotion，走 `@hulianui/ui/date-pickers` 子路径。日期族
#      在 0.15 起是 opt-in 子路径导入，而 `src/_mui/` 既不在根 barrel 也不在 showcase
#      barrel，库内 tsc 走相对路径、workspace 链接走目录直读，**两者都测不到这条 exports
#      映射**。没有这一场景，日期族的对外入口就是零覆盖。
#   两个场景装的依赖是互斥的（A 的断言依赖「没有 MUI」），所以必须各建各的工程。
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

# 场景 B 要装的 MUI 系列版本从 packages/ui 的 **devDependencies** 里读，而不是硬编码、
# 也不是读 peerDependencies。peer 声明的是 `>=9.2.0` 这种开区间，照它装会拉到最新大版本，
# 门禁就会因为上游发版而无关地变红；devDependencies 钉的才是仓库自己验证过的那一档。
MUI_DEPS_JSON="$(node -e '
const pkg = require(process.argv[1]);
const dev = pkg.devDependencies || {};
const want = ["@mui/material", "@mui/x-date-pickers", "@emotion/react", "@emotion/styled"];
const missing = want.filter((n) => !dev[n]);
if (missing.length) {
  console.error("✗ packages/ui 的 devDependencies 里缺 " + missing.join(" / ") + "，场景 B 无法确定该装哪个版本");
  process.exit(1);
}
// dayjs 是日期族的运行时依赖，在 ui 的 dependencies 里，消费方由 ui 自己带，无需显式装。
process.stdout.write(want.map((n) => JSON.stringify(n) + ": " + JSON.stringify(dev[n])).join(",\n    "));
' "$REPO_ROOT/packages/ui/package.json")"

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
  # 场景 B 装了 MUI 系列后同样适用（实测 MUI/emotion 的依赖链不带 @types/node）。
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

# ── 场景 A：baseline（不装 MUI）────────────────────────────────────────────────
# 空白消费方工程：只有 react / react-dom / typescript + 两个 tarball + 库声明的**非可选** peer。
# peer 必须装（消费方本来也得装，见 docs/consuming.md），否则失败原因会退化成
# 「找不到模块」，反倒盖住我们真正想抓的类型环境问题。
# 注意这里没有 @types/node —— 那正是被测的变量，别随手加回来。
# 同样注意这里**没有** @mui/* 与 @emotion/*：它们是 optional peer，此场景的价值正在于
# 证明「不装也能用」，随手补上就等于把契约测没了。
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
    "typescript": "$CONSUMER_TS_VERSION"
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
import { Button } from "@hulianui/ui";
import * as showcase from "@hulianui/ui/showcase";
import { Tag } from "@hulianui/ui/tag";
import { ThemeProvider } from "@hulianui/ui/theme";
import { cn } from "@hulianui/ui/lib";

export function App() {
  return (
    <ThemeProvider>
      <Tag className={cn("mr-2")}>标签</Tag>
      <Button variant="solid" size="md" onClick={() => console.log(Object.keys(showcase).length)}>
        点我
      </Button>
    </ThemeProvider>
  );
}
TSX

install_and_typecheck "$APP_A" "baseline · 无 MUI"

# ── 场景 B：date-pickers opt-in 子路径（装 MUI）──────────────────────────────
# 独立工程，在场景 A 的依赖上补齐四个 optional peer。这里刻意**不** import 根 barrel：
# 本场景要证明的只有一件事 —— `./date-pickers` 与 `./date-pickers/showcase` 这两条
# exports 条目在真实解析下成立，且日期族的组件与类型都能从子路径导出来。
APP_B="$WORKDIR/app-date-pickers"
rm -rf "$APP_B"
mkdir -p "$APP_B/src"
cat > "$APP_B/package.json" <<JSON
{
  "name": "hulian-consumer-smoke-date-pickers",
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
    "tailwindcss": "^4.3.0",
    $MUI_DEPS_JSON
  },
  "devDependencies": {
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "typescript": "$CONSUMER_TS_VERSION"
  }
}
JSON
write_tsconfig "$APP_B"

# 值类型与 Props 类型分开 import：前者验运行时导出，后者验 `export type` 那半边 ——
# 类型导出漏了不会让值导入报错，只有真的拿类型去标注变量才暴露。
cat > "$APP_B/src/app.tsx" <<'TSX'
import {
  Calendar,
  DatePicker,
  DateTimePicker,
  TimeField,
  MuiBridgeProvider,
  hulianMuiTheme,
} from "@hulianui/ui/date-pickers";
import type {
  CalendarProps,
  DatePickerProps,
  DateTimePickerProps,
  TimeFieldProps,
} from "@hulianui/ui/date-pickers";
import * as dateShowcase from "@hulianui/ui/date-pickers/showcase";

const calendarProps: CalendarProps = {};
const dateProps: DatePickerProps = { value: "2026-08-01" };
const dateTimeProps: DateTimePickerProps = {};
const timeProps: TimeFieldProps = {};

// MuiBridgeProvider 只吃 children（主题与 dayjs 本地化都在它内部装配好），
// 所以 hulianMuiTheme 单独取一次 —— 它是给要自建 MUI ThemeProvider 的消费方用的导出。
const bridgeTheme = hulianMuiTheme;

export function App() {
  return (
    <MuiBridgeProvider>
      <Calendar {...calendarProps} />
      <DatePicker {...dateProps} />
      <DateTimePicker {...dateTimeProps} />
      <TimeField {...timeProps} />
      <span>
        {Object.keys(dateShowcase).length}
        {bridgeTheme.palette.mode}
      </span>
    </MuiBridgeProvider>
  );
}
TSX

install_and_typecheck "$APP_B" "date-pickers · 装 MUI"

echo "✓ 两个消费方场景全部通过（${WORKDIR}）"
