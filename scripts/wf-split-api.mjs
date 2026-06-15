export const meta = {
  name: 'split-api-sections',
  description: '把每个组件 MD 的单一 Props 表拆成 Props / Events / Slots',
  phases: [{ title: 'Split', detail: '每批 ~8 组件一个 agent 拆分 API 表' }],
}

const ROOT = '/Users/zhangzhiwei/Desktop/code/hulian'
const SIZE = 8

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
          note: { type: 'string' },
        },
        required: ['slug', 'status', 'note'],
      },
    },
  },
  required: ['components'],
}

phase('Split')

// pilot bypass: pass args = [{slug,name,mdPath}, …] to process just those; else discover ALL.
let raw = args
if (typeof raw === 'string') raw = JSON.parse(raw)
let items = Array.isArray(raw) ? raw.filter((i) => i && i.mdPath) : []

if (!items.length) {
  const DISCOVER_SCHEMA = {
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
    `运行：\`cd ${ROOT} && node scripts/gen-component-docs.mjs --list\`\n它输出 JSON 数组，每项 {slug,name,category,group,mui,mdPath,status}。请解析并**全部**返回（不过滤），每项只保留 {slug,name,mdPath}。返回前核对条数与命令输出一致。`,
    { label: 'discover-all', phase: 'Split', schema: DISCOVER_SCHEMA },
  )
  items = (listed && listed.items) || []
}
log(`待拆分 API 段：${items.length} 个组件文档`)

const batches = []
for (let i = 0; i < items.length; i += SIZE) batches.push(items.slice(i, i + SIZE))

function prompt(batch) {
  const list = batch.map((b, i) => `${i + 1}. ${b.name} (${b.slug}) → ${ROOT}/${b.mdPath}`).join('\n')
  return `你在升级 @hulianui/ui 的组件使用文档，把**单一的 Props 表拆成 Props / Events / Slots 三类**（对标 Vant 组件文档）。本批 ${batch.length} 个：

${list}

对**每个** .md 文件：

1. Read 该 .md。再 Read 同目录的 \`<slug>.types.ts\`（与 .md 同目录，文件名把 .md 换成 .types.ts）确认每个属性的真实类型，用于准确分类。

2. 把现有「## Props」这一节里的表格按下列规则**拆成最多三节**，**插到原 Props 节的位置**（顺序：Props → Events → Slots），其余章节（标题/摘要/何时用/导入/示例/禁忌/相关/frontmatter）**原样不动**：
   - **## Props**（属性）：配置/数据/外观/状态类。如 variant、size、value/defaultValue、disabled、open、placeholder、columns、items 等。表头 \`| 名称 | 类型 | 默认 | 说明 |\`。
   - **## Events**（事件）：函数回调类，几乎都是 \`onXxx\`（onChange/onClick/onOpenChange/onValueChange/onConfirm…）。表头 \`| 事件 | 类型 | 说明 |\`（事件无"默认值"列，把回调签名放"类型"列，如 \`(value: string) => void\`）。
   - **## Slots**（插槽）：用于注入内容的 \`ReactNode\` / 渲染函数类属性。如 children、icon、title、header、footer、extra、action、label、description、trigger、renderItem 等。表头 \`| 插槽 | 类型 | 说明 |\`。
       · children 永远归 Slots。
       · 渲染函数（renderXxx: (...) => ReactNode）归 Slots（说明里点明它是渲染函数）。
   - 某类一个都没有 → **该节整节省略**（不要留空表）。
   - 判断边界：onX 一律 Events；ReactNode/ReactElement/渲染函数一律 Slots；其余 Props。className/style 归 Props。
   - **透传事件也要单列**：复合/薄包组件透传上游（Base UI Root 等）的常用事件 onValueChange/onOpenChange/onChange/onSelect 等，要在 Events 段补一行（签名照上游），别只埋在 Props 散文里。

3. 用 Write 写回整个文件。校验：三节表头正确、无空表、无属性丢失或重复（原 Props 表每一行都要落到某一节）、其它章节一字未改。

注意：有些组件原本就没有事件或插槽（如纯展示件），那就只保留 Props（甚至原样）。不要硬造。

全部完成后返回每个组件 {slug, status(done/skipped/failed), note}。note 一句话（拆出了哪几类 / 为何 skip）。`
}

const results = await parallel(
  batches.map((batch, bi) => () =>
    agent(prompt(batch), { label: `split#${bi + 1}(${batch.length})`, phase: 'Split', schema: SCHEMA }),
  ),
)

const flat = results.filter(Boolean).flatMap((r) => (r && r.components) || [])
return {
  batches: batches.length,
  total: items.length,
  done: flat.filter((c) => c.status === 'done').length,
  skipped: flat.filter((c) => c.status === 'skipped').length,
  failed: flat.filter((c) => c.status === 'failed').map((f) => `${f.slug}: ${f.note}`),
  nullBatches: results.filter((r) => !r).length,
}
