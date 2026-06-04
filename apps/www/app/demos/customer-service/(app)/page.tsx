import { Workbench } from "../_components/workbench/workbench";

// 会话工作台（旗舰）：撑满 AdminLayout 内容区，内部三栏各自滚动。
export default function CustomerServiceWorkbenchPage() {
  return (
    <div className="h-full overflow-hidden rounded-[var(--radius)] border border-border bg-bg">
      <Workbench />
    </div>
  );
}
