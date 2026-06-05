# 内置 Demo：AI 生图 / 视频工作流编排（Flow Studio）

> 设计规格 · 2026-06-04
> slug: `ai-workflow` · 入口 `/demos/ai-workflow` · 类别「AI 应用」

## 1. 目标与约束

做一个 **AI 生图 / 视频生成工作流编排** demo（气质对标 ComfyUI / Dify Flow / n8n）：用户在画布上把"提示词 → 模型生成 → 高清放大 → 图生视频 → 输出"这类节点连成一条流水线，点运行后逐节点模拟执行并产出图/视频。

**唯一硬约束**：100% 用 `@hulianui/ui` 搭建。任何组件缺口或不好用，回流到组件库——**新造组件或优化既有组件，禁止在 demo 里手搓 UI 绕路**。这个 demo 的首要价值是 dogfood 驱动组件库迭代。

**核心增量判断**：组件库目前**没有任何节点画布 / 连线 / 编排类组件**（grep `flow|node|canvas|edge|graph` 无果）。而"工作流编排"的灵魂正是节点画布。因此本 demo 的核心产出是给 `@hulianui/ui` 新造一个可复用的 **`Flow` 节点画布编排组件**，demo 只是它的第一个真实消费者。

**非目标（YAGNI）**：
- 不接真实 AI API / 后端（全部内存 mock + 模拟执行 + 程序化生成占位产物）
- 不做协作 / 版本 / 多租户 / 鉴权（沿用 CRM demo 的简化口径，仅留一个装饰性登录页）
- Flow 不做 minimap / 框选多选 / 撤销重做（列 backlog，本期单选 + 拖拽 + 连线 + 平移缩放足够）

## 2. 核心新组件：`Flow`（节点画布编排器）

落 `packages/ui/src/flow/`，接入流程对齐库内既有组件（导出进 `src/index.ts`、补 `.showcase.tsx`、登记 `showcase.ts` 与 `apps/www/lib/manifest.ts`，token 走主题 CSS 变量单一真源）。归类 `data-display / collection`（与 Kanban 同列——都是受控的交互式编排视图）。

### 2.1 设计原则
- **受控**：`nodes` / `edges` 由消费者持有，组件只回吐变更事件，不偷改业务数据（照 Kanban `onMove` 范式）。
- **皮肤与内容分离**：节点外框（选中态/连接桩/拖拽手柄）由组件管；节点**内容**由消费者 `renderNode` 渲染（demo 用 Card/Field/Select/Slider 等搭各类型节点）。
- **零额外依赖**：用原生 Pointer Events 做画布平移、节点拖拽、连线（@dnd-kit 适合列表排序，不适合自由二维画布；参考 swipe-action/picker 的 pointer 范式）。SVG 画贝塞尔连线（参考 animated-beam 几何）。
- **几何纯函数可测**：连线路径串、桩坐标、屏幕↔画布坐标变换抽到 `flow-geometry.ts` 纯函数，带单测。

### 2.2 数据模型
```ts
interface FlowNode<T = unknown> {
  id: string;
  position: { x: number; y: number };   // 画布坐标
  data: T;                               // 业务数据，消费者自定义
  width?: number;                        // 默认列宽
}
interface FlowEdge {
  id: string;
  source: string; sourceHandle?: string; // 起点节点 / 输出桩
  target: string; targetHandle?: string; // 终点节点 / 输入桩
}
interface FlowHandleSpec { id: string; type: "source" | "target"; }
```

### 2.3 API（`<Flow>`）
| prop | 说明 |
|---|---|
| `nodes` / `edges` | 受控数据 |
| `onNodesChange(nodes)` | 拖拽后回吐新位置（整组回吐，消费者落库） |
| `onConnect(edge)` | 从输出桩拖到输入桩成功 → 新连线（无 id，消费者补 id 去重） |
| `onEdgesDelete(ids)` | 删连线（点连线选中后 Del/点 ×） |
| `getHandles(node) => FlowHandleSpec[]` | 声明各节点的输入/输出桩（左=target，右=source） |
| `renderNode(node, ctx)` | 渲染节点内容；ctx: `{ selected, running }` |
| `selectedId` / `onSelectNode(id\|null)` | 单选受控 |
| `onNodeDelete(id)` | 删节点 |
| `minZoom`/`maxZoom`/`fitView` | 视口控制 |
| `controls` | 是否显示右下角缩放/适配工具条（dogfood Button） |
| `background` | 画布底纹（默认 dogfood DotPattern） |

### 2.4 交互
- **平移**：拖拽画布空白处 → 整体 translate；滚轮 = 平移，Ctrl/⌘+滚轮或工具条 = 缩放。
- **拖节点**：在节点手柄区按下拖动 → 实时更新位置，松手回吐 `onNodesChange`。
- **连线**：从输出桩按下拖出一条"橡皮筋"贝塞尔预览线，落到合法输入桩 → `onConnect`；落空取消。
- **选中**：点节点 → `onSelectNode`；点空白取消；选中连线 → Delete/Backspace 删除。
- **a11y / reduced-motion**：连线流光在 `prefers-reduced-motion` 下静止；桩有可聚焦/aria-label。

### 2.5 文件
```
packages/ui/src/flow/
  flow.types.ts
  flow-geometry.ts        # 纯函数：bezierPath / handlePoint / screenToCanvas
  flow-geometry.test.ts
  flow.tsx                # 画布编排者（viewport + 事件总线）
  flow-node.tsx           # 节点外框 + 连接桩
  flow.showcase.tsx       # 库内独立可用示例（一条 mini 流水线）
  index.ts
```

## 3. Demo 模块与组件映射

气质 = 全幅创作工作室（非 admin 表格），用**自定义 Studio 外壳**（顶栏 + 左节点库 + 中画布 + 右检查器），而非 AdminLayout。

### 3.1 登录 `/demos/ai-workflow/login`
装饰性，dogfood `LoginForm`（与 CRM/客服 demo 一致）。

### 3.2 编排画布（主页）`/demos/ai-workflow`
核心体验，单页工作室：
- **顶栏**：工作流名（可编辑 Input）、保存/清空、**运行**按钮（ShimmerButton）、运行状态、主题切换、用户（User）。
- **左侧节点库**：可点/拖添加的节点类型卡（提示词 / 参考图 / 生图模型 / 高清放大 / 图生视频 / 输出），dogfood Card + Tag + 图标 + ScrollArea + 可折叠分组（Collapsible）。
- **中央画布**：`<Flow>`。各节点用 hulian 组件搭内容：
  - `prompt` 提示词：Textarea（正向）+ Textarea（负向）+ Tag 风格预设
  - `image-input` 参考图：Upload 落区 + Image 缩略
  - `model` 生图模型：Select 模型 + Select 采样器 + Slider(步数/CFG) + Segmented(尺寸比例)
  - `upscale` 高清放大：Segmented 倍数 + Switch 面部修复
  - `i2v` 图生视频：Slider 时长/帧率 + Select 运动幅度
  - `output` 输出：产物缩略格（运行后填充）
  - 节点头部状态用 Dot/Spinner/Tag（待执行/运行中/完成/失败）。
- **右侧检查器**：选中节点 → ProForm/Field 编辑其参数（与节点内联控件双向同步，单一数据源）；未选中 → 工作流概览（节点数/连线数/预计耗时/Steps 流程预览）。
- **底部运行抽屉**（Drawer/可收起面板）：点运行后按拓扑序逐节点执行（Progress + Steps + StreamingText 模拟提示词解析 + 各节点 Spinner→Check），产物落到 output 节点与产物面板。
- **模拟执行**：`use-flow-run.ts` 拓扑排序 + 定时推进；产物 = 由节点参数派生的**程序化渐变"画作"**（CSS conic/linear gradient，离线确定性，零素材）；视频产物复用 `public/demo/sample-video.mp4` 经 Video 组件。

### 3.3 模板库 `/demos/ai-workflow/templates`
预置工作流模板卡（文生图基础 / 文生图+放大 / 图生图重绘 / 文生视频 / 图生视频），dogfood BentoGrid/Card + Tag + 缩略流程图（用 Flow 只读快照）。点"使用模板"→ 载入画布。

### 3.4 产物画廊 `/demos/ai-workflow/gallery`
历史产物网格：dogfood Image + AspectRatio + Tag（图/视频）+ Masonry?（无则用 Grid/columns）。点开 → Dialog 大图详情（参数/种子/所属工作流）；视频产物用 Video。

## 4. 过程中就地优化的既有组件
按实际缺口发现即改、不在 demo 里绕路；当前预判可能触达：
- `Upload`：参考图节点若需更紧凑的单图替换形态 → 视情况加 `variant`。
- `Segmented`/`Slider`：节点内联紧凑尺寸若不够 → 补 size。
- 任何"不够好用"回流组件库，commit message 注明。

## 5. 目录结构（镜像 CRM demo）
```
apps/www/app/demos/ai-workflow/
  (app)/
    layout.tsx                 # StudioShell 外壳（route group）
    page.tsx                   # 编排画布（工作室）
    templates/page.tsx         # 模板库
    gallery/page.tsx           # 产物画廊
  login/page.tsx               # 装饰登录（LoginForm）
  _components/
    studio-shell.tsx           # 顶栏 + 导航 + 主题/用户
    nav-config.tsx
    canvas/                     # 画布相关：palette / inspector / run-drawer / node 渲染
    nodes/                      # 各类型节点内容渲染
  _data/
    types.ts                   # FlowNodeData 联合类型 / 模板 / 模型 / 产物
    node-kinds.ts              # 节点类型注册表（图标/默认参数/桩/默认尺寸）
    templates.ts               # 预置工作流
    models.ts                  # mock 模型清单
    artifacts.ts               # mock 历史产物
  _lib/
    use-flow-run.ts            # 模拟执行（拓扑序 + 进度）
    artwork.ts                 # 程序化渐变产物生成（确定性）
```

## 6. 交付切片
- **Slice A**：新组件 `Flow`（几何纯函数 + 单测 → 画布/节点/连线/平移缩放 → showcase → manifest/barrel），库内独立自洽可用。
- **Slice B**：demo 数据层（types/node-kinds/templates/models/artifacts）+ StudioShell + nav + login + route group 空页占位 + demos.ts 登记。
- **Slice C**：编排画布主页（palette + 各类型节点渲染 + Flow 接线 + inspector + 运行栏 + use-flow-run + 产物面板）。
- **Slice D**：模板库 + 产物画廊。
- **Slice E**：登记画廊卡 + typecheck/test + Playwright 视觉自查（含暗色/响应式）。

## 7. 验收口径
- `Flow` 组件在库内 showcase 独立可用：拖节点、连线、平移缩放、选中删除，token 吃主题、暗色正常、几何纯函数有单测。
- 画布可：从左侧添加节点 → 连成流水线 → 编辑参数 → 运行 → 看到逐节点进度 → output 出程序化产物。
- 模板可一键载入画布；产物画廊可浏览并点开详情（图用 Dialog、视频用 Video）。
- 0 手搓业务 UI（节点内容、检查器、画廊全部由 `@hulianui/ui` 组件搭）。
- 挂进 `/demos` 画廊卡片可达。
