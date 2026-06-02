import Link from "next/link";
import { Button, Switch } from "@hulian/ui";
import { ThemeToggle } from "../components/theme-toggle";
import { DialogDemo } from "../components/dialog-demo";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-6 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">瑚琏 Hulian</h1>
          <p className="mt-1 text-sm text-muted">颜值 + 好用的 React 设计系统</p>
        </div>
        <ThemeToggle />
      </header>

      <section className="space-y-5">
        <h2 className="text-sm font-medium text-muted">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button>默认</Button>
          <Button variant="outline">描边</Button>
          <Button variant="ghost">幽灵</Button>
          <Button tone="danger">危险</Button>
          <Button loading>加载</Button>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-medium text-muted">Switch</h2>
        <div className="flex items-center gap-3">
          <Switch defaultChecked aria-label="演示开关" />
          <span className="text-sm text-muted">受控开关 · 焦点环 · ARIA</span>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-sm font-medium text-muted">Dialog</h2>
        <DialogDemo />
      </section>

      <footer className="border-t border-border pt-6">
        <Link href="/components" className="text-sm text-primary hover:underline">
          查看组件展示页 →
        </Link>
      </footer>
    </main>
  );
}
