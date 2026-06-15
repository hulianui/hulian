export const meta = {
  name: 'author-examples',
  description: '给每个组件 showcase 撰写 Vant 式 examples（代码+活预览）并上报组件问题',
  phases: [{ title: 'Author', detail: '每批 ~6 组件一个 agent 写 examples' }],
}

const ROOT = '/Users/zhangzhiwei/Desktop/code/hulian'
const SIZE = 6

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    components: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          slug: { type: 'string' },
          status: { type: 'string', enum: ['done', 'skipped', 'failed'] },
          exampleCount: { type: 'number' },
          note: { type: 'string' },
          issues: {
            type: 'array',
            description: '读源码时发现的组件真实问题（非文档问题）',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                severity: { type: 'string', enum: ['bug', 'a11y', 'type', 'smell'] },
                summary: { type: 'string' },
                location: { type: 'string', description: '文件:行 或 函数名' },
              },
              required: ['severity', 'summary', 'location'],
            },
          },
        },
        required: ['slug', 'status', 'exampleCount', 'note', 'issues'],
      },
    },
  },
  required: ['components'],
}

phase('Author')

let raw = args
if (typeof raw === 'string') raw = JSON.parse(raw)
let items = Array.isArray(raw) ? raw.filter((i) => i && i.mdPath) : []

if (!items.length) {
  const DS = {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { slug: { type: 'string' }, name: { type: 'string' }, mdPath: { type: 'string' } },
          required: ['slug', 'name', 'mdPath'],
        },
      },
    },
    required: ['items'],
  }
  const listed = await agent(
    `运行：\`cd ${ROOT} && node scripts/gen-component-docs.mjs --list\`，解析其 JSON 数组，全部返回每项 {slug,name,mdPath}。`,
    { label: 'discover-all', phase: 'Author', schema: DS },
  )
  items = (listed && listed.items) || []
}
log(`待撰写 examples：${items.length} 个组件`)

const batches = []
for (let i = 0; i < items.length; i += SIZE) batches.push(items.slice(i, i + SIZE))

function prompt(batch) {
  const list = batch
    .map((b, i) => {
      const showcase = `${ROOT}/${b.mdPath.replace(/\.md$/, '.showcase.tsx')}`
      return `${i + 1}. ${b.name} (${b.slug})\n   showcase: ${showcase}\n   源码同目录：<slug>.tsx / <slug>.types.ts`
    })
    .join('\n')
  return `你在给 @hulianui/ui 组件库的 showcase 补「用法示例」(examples)，对标 Vant 组件文档——每个示例是「标题 + 说明 + 代码 + 活预览」。本批 ${batch.length} 个：

${list}

ShowcaseSpec 已新增可选字段（packages/ui/src/showcase/types.ts）：
  examples?: { title: string; description?: string; code: string; render: () => ReactNode }[]

对**每个**组件：

1. Read 它的 showcase.tsx、同目录 <slug>.tsx（组件实现）、<slug>.types.ts（API）。**若 showcase 已有 \`examples:\` 字段则跳过**（status=skipped）。

2. 在 \`export const xxxShowcase: ShowcaseSpec = {\` 紧下面插入一个 \`examples: [...]\`（2–5 个场景，从基础到进阶，覆盖该组件的核心用法/变体/状态）。每个示例：
   - \`title\`：中文场景名（基础用法 / 尺寸 / 变体 / 禁用态 / 受控 …）。
   - \`description\`：一句话（可省略不写该字段）。
   - \`code\`：用户可直接复制的 JSX 字符串（多行用模板字符串，缩进规范）。
   - \`render\`：与 code **视觉一致**的活预览。
   - **铁律——render 必须无状态**：不得在 render 里用 useState/useEffect 等 Hook（它会在父组件 render 中被调用，违反 Hooks 规则）。要交互就用**非受控**写法（defaultValue/defaultOpen…）。code 与 render 保持一致。
   - 多个并列元素用 \`<>…</>\` 包裹。复合组件（如 Dialog/Select/Menu）按其正确组合写（Trigger+Content+Item…）。
   - 只用该 showcase 文件**已 import**的组件；若示例需要新组件，在文件顶部补 import（确保来自 "@hulianui/ui" 或既有相对路径，别引不存在的东西）。

3. 用 Write 写回整个文件。**务必保证文件仍是合法 TS/JSX 且能编译**：括号/逗号闭合、所有用到的标识符都已 import、examples 类型匹配。保留原有 controls/states/renderWithProps/toCode 不动。

4. **顺带审查组件源码**：读 <slug>.tsx 时如发现**真实组件问题**（逻辑 bug、a11y 缺失、类型错误、明显坏味道），记进 issues（severity + 一句话 summary + location）。**只记不改**——源码修复由主线统一甄别。没发现就返回空数组。

完成后返回每个组件 {slug, status, exampleCount, note, issues}。`
}

const results = await parallel(
  batches.map((batch, bi) => () =>
    agent(prompt(batch), { label: `examples#${bi + 1}(${batch.length})`, phase: 'Author', schema: SCHEMA }),
  ),
)

const flat = results.filter(Boolean).flatMap((r) => (r && r.components) || [])
const issues = flat.flatMap((c) => (c.issues || []).map((is) => ({ slug: c.slug, ...is })))
return {
  batches: batches.length,
  total: items.length,
  done: flat.filter((c) => c.status === 'done').length,
  skipped: flat.filter((c) => c.status === 'skipped').length,
  failed: flat.filter((c) => c.status === 'failed').map((f) => `${f.slug}: ${f.note}`),
  issueCount: issues.length,
  issues,
  nullBatches: results.filter((r) => !r).length,
}
