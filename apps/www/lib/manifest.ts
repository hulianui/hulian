// 瑚琏文档站 IA 元数据 —— 纯数据 SSOT，零 @hulian/ui import，server / client 皆可安全读。
export type CategoryKey = "inputs" | "data-display" | "feedback" | "navigation" | "effects";

export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  status: "stable" | "new";
}

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "inputs", label: "表单录入" },
  { key: "data-display", label: "数据展示" },
  { key: "feedback", label: "反馈" },
  { key: "navigation", label: "导航" },
  { key: "effects", label: "动效" },
];

export const manifest: ComponentMeta[] = [
  { slug: "button", name: "Button", description: "按钮 · CVA 变体 + press 动效", category: "inputs", status: "stable" },
  { slug: "switch", name: "Switch", description: "开关 · Base UI 受控 + ARIA", category: "inputs", status: "stable" },
  { slug: "dialog", name: "Dialog", description: "对话框 · Base UI Portal + focus trap", category: "feedback", status: "stable" },
];
