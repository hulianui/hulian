export const meta = {
  name: 'fix-component-bugs',
  description: '修复审计发现的组件 bug（每 agent 一个，最小正确修复 + 补测试）',
  phases: [{ title: 'Fix', detail: '每个 bug 一个 agent' }],
}

const ROOT = '/Users/zhangzhiwei/Desktop/code/hulian'

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string' },
    outcome: { type: 'string', enum: ['fixed', 'wontfix', 'failed'] },
    fix: { type: 'string', description: '改了什么（或 wontfix 理由）' },
    testAdded: { type: 'boolean' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['slug', 'outcome', 'fix', 'testAdded', 'confidence'],
}

let bugs = args
if (typeof bugs === 'string') bugs = JSON.parse(bugs)
bugs = Array.isArray(bugs) ? bugs.filter((b) => b && b.slug) : []

phase('Fix')

if (!bugs.length) {
  const DS = {
    type: 'object',
    additionalProperties: false,
    properties: {
      bugs: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: { slug: { type: 'string' }, summary: { type: 'string' }, location: { type: 'string' } },
          required: ['slug', 'summary', 'location'],
        },
      },
    },
    required: ['bugs'],
  }
  const listed = await agent(
    `运行 \`cat /tmp/hulian-bugs.json\`，它是一个 JSON 数组（每项 {slug,summary,location}）。原样全部返回为 bugs。`,
    { label: 'load-bugs', phase: 'Fix', schema: DS },
  )
  bugs = (listed && listed.bugs) || []
}
log(`待修 bug：${bugs.length}`)

function prompt(b) {
  return `你是 @hulianui/ui 组件库维护者，修复一个**审计发现的真实组件 bug**（不是文档问题）。

组件：${b.slug}
定位：${b.location}
问题描述：${b.summary}

步骤：
1. 找到并 Read 组件源码（一般在 \`${ROOT}/packages/ui/src/${b.slug}/${b.slug}.tsx\`；_mui 桥件在 \`${ROOT}/packages/ui/src/_mui/${b.slug}.tsx\`；按定位里的文件名为准）。同目录可能有 \`<slug>.types.ts\` / \`<slug>.test.tsx\` / 纯函数文件。
2. **核实**问题描述是否确为真 bug：
   - 若源码注释/设计表明是**有意取舍**或是**契约约束**而非缺陷 → outcome=wontfix，说明理由，**不要强改**。
   - 若确是 bug → 实施**最小、正确、不改变既有正常行为**的修复。常见模式：
       · 越界/NaN：加 clamp 或长度守卫（如 \`Math.min(index, n-1)\`、\`total > 0 ? a/total : 0\`）。
       · setTimeout/事件监听未清理：在 effect cleanup / unmount 里 clearTimeout/removeEventListener。
       · 自动贴底打断用户上滚：滚动前判断「是否已接近底部」，否则不强制 scrollTop。
       · useEffect 缺依赖致每渲染重跑：补正确依赖数组（注意别引入新 bug）。
3. **补测试**：若该 bug 可被 \`<slug>.test.tsx\`（vitest + jsdom）覆盖（尤其纯函数/几何/状态逻辑），加一个**聚焦该 bug 的最小用例**（已有 test 文件就追加，没有且值得就新建）。纯视觉/物理/rAF 类难测的可不加（testAdded=false）。
4. 用 Edit/Write 落地。**保证 \`tsc --noEmit\` 不报错**、不破坏同文件既有逻辑与测试。

返回 {slug, outcome, fix, testAdded, confidence}。`
}

const results = await parallel(
  bugs.map((b) => () => agent(prompt(b), { label: `fix:${b.slug}`, phase: 'Fix', schema: SCHEMA })),
)

const flat = results.filter(Boolean)
return {
  total: bugs.length,
  fixed: flat.filter((r) => r.outcome === 'fixed').map((r) => `${r.slug}(${r.confidence}${r.testAdded ? '+test' : ''})`),
  wontfix: flat.filter((r) => r.outcome === 'wontfix').map((r) => `${r.slug}: ${r.fix}`),
  failed: flat.filter((r) => r.outcome === 'failed').map((r) => `${r.slug}: ${r.fix}`),
  nullAgents: results.filter((r) => !r).length,
}
