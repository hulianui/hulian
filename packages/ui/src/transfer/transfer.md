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

> 穿梭框 · 左右双 listbox 面板 + 移动按钮(选中/全部) + 可选搜索 + 空态(零依赖·复用 Listbox/Empty) · forms/advanced

## 何时用

权限分配、可见字段、白名单等「从全集里挑一批进目标集」且两侧都要可见可搜的场景用。当候选项有几十上百条、要批量勾选并能两边对照时比多选 [Listbox](../listbox/listbox.md) 直观。如果只是单列多选、不需要「已选/未选」分栏对照，用 Listbox `multiple` 即可。

## 导入
```ts
import { Transfer } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| dataSource* | `TransferItem[]` | — | 全量数据源；每项 `key`/`label`，可带 `description`/`disabled` |
| targetKeys | `string[]` | — | 受控：右侧（目标）面板的键集合 |
| defaultTargetKeys | `string[]` | — | 非受控初始目标键 |
| onChange | `(targetKeys, direction, movedKeys) => void` | — | 移动后回调，`direction` 为 `"right"`（入选）/`"left"`（移出） |
| titles | `[ReactNode, ReactNode]` | `["源列表","已选"]` | 左右面板标题 |
| searchable | `boolean` | `false` | 每个面板顶部显示搜索框 |
| searchPlaceholder | `string` | `"搜索"` | 搜索框占位符 |
| filterOption | `(input: string, item: TransferItem) => boolean` | label 包含匹配 | 自定义过滤（默认大小写不敏感子串） |
| disabled | `boolean` | `false` | 整体禁用（两侧列表与移动按钮全失效） |
| className | `string` | — | 容器类名 |

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
- 暂无其它已知坑。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md)
