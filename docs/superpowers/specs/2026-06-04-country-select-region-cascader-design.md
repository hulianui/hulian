# 设计：CountrySelect（国家选择器）+ RegionCascader（省市区级联）

- 日期：2026-06-04
- 状态：✅ 已实现并验证（tsc 0 错 · 全包 1182 测试通过 · manifest/registry 同步 · sideEffects:false 保证数据按需）
- 范围：给 `@hulian/ui` 表单族补两个选择器；为此扩展两个底座组件

## 1. 目标

中后台表单缺「国家选择器」和「省市区三级联动选择器」。两者都 **dogfood 现有底座**（Combobox / Cascader），数据 **内置全量**（用户明确选择，接受体量）。

## 2. 用户已拍板的决策

| 决策点 | 结论 |
|---|---|
| 数据供给 | 组件内置全量数据 |
| 省市区层级 | 3 级（省/市/区县，全量 ~3429 节点） |
| 国家选择器能力 | 国旗 emoji + 中文名 + 英文名 + 区号(+86) + 搜索 + **多选** |
| 多选实现 | **方案 A：扩底座 Combobox 支持 `multiple`**（Base UI 原生支持，单选保持默认向后兼容） |
| 省市区搜索 | **要**（扩底座 Cascader 支持 `showSearch`） |

## 3. 数据源（构建期拉取 + 裁剪后提交进仓库，不手打）

### 3.1 省市区 → `region-cascader/cn-divisions.data.ts`
- 源：`https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pca-code.json`（国家统计局口径，已验证可达，137KB，3429 节点）
- 形状：`[{code, name, children:[{code, name, children:[{code, name}]}]}]`
- 转换：`code→key`、`name→label`，递归保留 `children` → 直接成 `TreeNode[]`
- 产物：`export const cnDivisions: TreeNode[]`（约 137KB 源码，gzip ~40KB）

### 3.2 国家 → `country-select/countries.data.ts`
- 源：`https://raw.githubusercontent.com/mledoze/countries/master/countries.json`（已验证，250 国，中文名 0 缺失）
- 取字段：`cca2`(ISO2)、`translations.zho.common`(中文)、`name.common`(英文)、`idd`(区号)
- 区号规则：`dial = idd.root + (idd.suffixes.length === 1 ? idd.suffixes[0] : "")`
  - CN：`+8` + `6` = `+86`；US：`+1`（多后缀=NANP 区号，只取 root）；无 idd 的 2 条 → `dial: ""`
- 产物：`export const countries: Country[]`，`Country = { code: string; cn: string; en: string; dial: string }`（~250 条，~15KB）
- **国旗不入库**：`flagEmoji(code)` 由 ISO2 码点现算（`CN→🇨🇳`，零数据成本）

## 4. 底座扩展

### 4.1 Combobox 支持 `multiple`（方案 A）
- 现状：`combobox.types.ts` 把泛型钉死 `BaseCombobox.Root.Props<ComboboxItemData, false>`，注释"Multiple 固定 false"。Base UI 的 `Combobox.Root` 原生支持 `<Value, true>` 多选 + `Combobox.Chips`/`Chip` 回显。
- 改动：
  - `ComboboxProps` 解钉为可单/可多：`multiple?: boolean`，value 类型随之为 `ComboboxItemData | ComboboxItemData[]`（用 Base UI 的泛型重载/条件类型表达）
  - 多选时 Trigger 区用 `Combobox.Chips` + `Combobox.Chip`（带删除）回显已选；单选保持现状
  - **向后兼容**：不传 `multiple` 时行为与现在完全一致
- 风险：Base UI 泛型类型体操 + Chips 皮肤是本次最需小心处。单测覆盖单选回归 + 多选增删。

### 4.2 Cascader 支持 `showSearch`
- 现状：`cascader/cascader.tsx` 列式浏览，无搜索。
- 改动：加 `showSearch?: boolean`。开启后 Trigger 浮层顶部出搜索框；输入时把树扁平成「叶子路径」按 `路径 label join` 模糊匹配，命中项以 `上海市 / 上海市 / 浦东新区` 扁平行展示，选中即把 `value` 设为该路径。
- 纯逻辑（可单测）：`flattenPaths(nodes): {keys:string[], labels:string[]}[]` + `filterPaths(paths, query)`。
- **向后兼容**：不传 `showSearch` 时无搜索，行为不变。

## 5. 新组件

### 5.1 RegionCascader（`region-cascader/`）
薄封装 Cascader + 内置数据。
- Props：
  - `value?: string[]` / `defaultValue?: string[]`（码路径）
  - `onChange?(codes: string[], names: string[])` —— 同时给码与名（表单常存名）
  - `level?: 2 | 3`（默认 3；2 = 省/市，构建期对数据做深度裁剪）
  - `showSearch?: boolean`（默认 true，按用户要求）
  - `changeOnSelect?` / `placeholder?` / `size?` / `disabled?` / `invalid?` / `className?`（透传 Cascader）
- 内部：`level===2` 时把 `cnDivisions` 砍掉第三层再喂 Cascader。

### 5.2 CountrySelect（`country-select/`）
封装 Combobox（含多选）。
- Props：
  - `value?: string | string[]`（ISO2；多选为数组）/ `defaultValue?`
  - `onChange?(next: string | string[])`
  - `multiple?: boolean`（默认 false）
  - `showEnglish?: boolean`（默认 true）、`showDialCode?: boolean`（默认 false）
  - `clearable? / size? / disabled? / invalid? / placeholder? / className?`
- 选项渲染：`🇨🇳 中国  China  +86`（英文名/区号按开关、muted 色，搜索高亮可选不做）
- 搜索过滤：按 `cn / en / code / dial` 任一包含 query（纯函数 `filterCountries`）
- 导出辅助：`getCountry(code): Country | undefined`、`flagEmoji(code): string`（供手机号表单复用区号）

## 6. 文件落位
```
country-select/
  index.ts  country-select.tsx  country-select.types.ts
  countries.data.ts  country-select.logic.ts(filter/flag/get)
  country-select.showcase.tsx  country-select.test.tsx
region-cascader/
  index.ts  region-cascader.tsx  region-cascader.types.ts
  cn-divisions.data.ts  region-cascader.logic.ts(flatten/filter/sliceLevel)
  region-cascader.showcase.tsx  region-cascader.test.tsx
```
- 主 barrel `src/index.ts` 导出两组件 + 辅助函数。
- showcase registry 接线（注意 memory 记录的 registry 重构正在进行，按现行约定接，不逆向 mass-patch）。
- 数据作模块内 `*.data.ts`：消费者 `import { RegionCascader }` 才会拉到 137KB（模块级 tree-shake），不强加给其他组件——仍走主入口，非被否的"独立子入口"。

## 7. 测试
- 纯函数：`flagEmoji`、`filterCountries`、`flattenPaths`/`filterPaths`、`sliceLevel`、数据完整性（计数、code 去重、dial 规则抽样）
- 组件：CountrySelect 渲染/单选选中/多选增删/搜索过滤/clear；RegionCascader 三级联动/onChange 给码+名/搜索直达/level=2 裁剪
- Combobox 回归：单选行为不变；Cascader 回归：无 showSearch 行为不变

## 8. 非目标（YAGNI）
- 国家选择器搜索高亮、分组（常用国家置顶）暂不做
- 省市区异步 loadData、海外行政区暂不做
- 手机号一体输入组件（区号+号码）不在本次，仅导出 `getCountry`/`flagEmoji` 供其拼装

## 9. 验证
- 构建期 transform 脚本一次性产数据（不入运行时依赖）。
- `tsc --noEmit` + vitest 全绿；showcase 可视验证（`pnpm --filter www dev`）。
