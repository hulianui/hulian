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
  { slug: "badge", name: "Badge", description: "徽标 · solid/soft/outline × tone", category: "data-display", status: "new" },
  { slug: "card", name: "Card", description: "卡片 · Header/Body/Footer 插槽", category: "data-display", status: "new" },
  { slug: "skeleton", name: "Skeleton", description: "骨架屏 · shimmer 高光占位", category: "data-display", status: "new" },
  { slug: "avatar", name: "Avatar", description: "头像 · Base UI 图片+fallback", category: "data-display", status: "new" },
  { slug: "input", name: "Input", description: "输入框 · Base UI Field + 前后缀 + invalid", category: "inputs", status: "new" },
  { slug: "textarea", name: "Textarea", description: "多行输入 · 自适应高度", category: "inputs", status: "new" },
  { slug: "field", name: "Field", description: "字段包装 · label/help/error a11y 串联", category: "inputs", status: "new" },
  { slug: "checkbox", name: "Checkbox", description: "复选框 · 三态(含半选) + Base UI", category: "inputs", status: "new" },
  { slug: "radio", name: "Radio", description: "单选 · RadioGroup 单选组 + 键盘方向键", category: "inputs", status: "new" },
  { slug: "alert", name: "Alert", description: "提示条 · tone×variant 皮肤 + a11y role", category: "feedback", status: "new" },
  { slug: "slider", name: "Slider", description: "滑块 · Base UI 单值/range + 键盘步进", category: "inputs", status: "new" },
  { slug: "tabs", name: "Tabs", description: "选项卡 · Base UI 无浮层 + underline/solid 滑块", category: "navigation", status: "new" },
  { slug: "tooltip", name: "Tooltip", description: "提示浮层 · Base UI Positioner + 箭头 + hover 触发", category: "feedback", status: "new" },
  { slug: "popover", name: "Popover", description: "气泡卡片 · click 触发 + 标题/描述/Close", category: "feedback", status: "new" },
  { slug: "accordion", name: "Accordion", description: "手风琴 · Base UI 单/多开 + 高度过渡", category: "navigation", status: "new" },
  { slug: "breadcrumb", name: "Breadcrumb", description: "面包屑 · 纯皮肤静态 + aria-current 当前页语义", category: "navigation", status: "new" },
];
