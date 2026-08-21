---
slug: transfer
name: Transfer
category: forms
group: advanced
tags: []
exports: [Transfer]
status: enriched
---

# Transfer

> 在待选和已选两个列表之间搬运条目 · forms/advanced

## 何时用

权限分配、可见字段、白名单等「从全集里挑一批进目标集」且两侧都要可见可搜的场景用。当候选项有几十上百条、要批量勾选并能两边对照时比多选 [Listbox](../listbox/listbox.md) 直观。如果只是单列多选、不需要「已选/未选」分栏对照，用 Listbox `multiple` 即可。

## 导入
```ts
import { Transfer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| dataSource* | `TransferItem[]` | - | 全量数据源；每项 `key`/`label`，可带 `description`/`disabled` |
| targetKeys | `string[]` | - | 受控：右侧（目标）面板的键集合 |
| defaultTargetKeys | `string[]` | - | 非受控初始目标键 |
| searchable | `boolean` | `false` | 每个面板顶部显示搜索框 |
| searchPlaceholder | `string` | `"搜索"` | 搜索框占位符 |
| filterOption | `(input: string, item: TransferItem) => boolean` | label 包含匹配 | 自定义过滤（默认大小写不敏感子串） |
| listHeight | `number` | `240` | 面板列表区最大高度（px）。几百节点的权限/部门数据下把它调大，否则面板挤成一条缝 |
| showSelectAll | `boolean` | `false` | 面板标题栏显示全选复选框（只作用于**当前过滤结果里的可用项**） |
| disabled | `boolean` | `false` | 整体禁用（两侧列表与移动按钮全失效） |
| className | `string` | - | 容器类名 |

`TransferItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key * | `string` | - | 唯一键，也是 `targetKeys` 的取值 |
| label * | `ReactNode` | - | 条目主文案 |
| description | `ReactNode` | - | 次级描述（label 下方弱化小字） |
| disabled | `boolean` | `false` | 该条不可选、不可移动 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(targetKeys: string[], direction: "left" \| "right", movedKeys: string[]) => void` | 移动后回调，`direction` 为 `"right"`（入选）/`"left"`（移出） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| titles | `[ReactNode, ReactNode]` | 左右面板标题（默认 `["源列表","已选"]`） |

## 示例
```tsx
const [target, setTarget] = useState<string[]>(["dashboard", "orders"]);
<Transfer
  dataSource={modules}
  targetKeys={target}
  onChange={setTarget}
  titles={["全部功能模块", "已授权"]}
  searchable
/>
```

## 禁忌 / 坑

- `onChange` 首参就是移动后的完整目标键集合，直接 `setTarget` 即可（无需自己合并 `movedKeys`）；后两参 `direction`/`movedKeys` 用于审计/差量提示。
- `disabled` 的 item 不可勾选、也**不随「全部移入/移出」按钮移动**——设计如此，用于冻结历史项。
- `showSelectAll` 的全选**只覆盖当前过滤结果里的可用项**：搜出 3 条时点全选，不会把被过滤掉的另外 200 条也勾上。清空搜索后再点一次才是全量。
- 面板列表尚无虚拟滚动，上千节点时靠 `listHeight` + 滚动扛。真到万级请先在数据层分组/懒加载。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
