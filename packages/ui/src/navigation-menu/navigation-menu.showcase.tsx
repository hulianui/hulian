"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./navigation-menu";

const products = [
  { title: "数据平台", desc: "元数据驱动的低代码引擎" },
  { title: "工作流", desc: "桌面 RPA 与证据自动化" },
  { title: "同城服务", desc: "家政服务小程序矩阵" },
  { title: "社区互动", desc: "本地生活内容平台" },
];

function Demo({ delay = 100 }: { delay?: number }) {
  return (
    <NavigationMenu delay={delay}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[28rem] grid-cols-2 gap-1">
              {products.map((p) => (
                <NavigationMenuLink key={p.title} href="#" className="block px-3 py-2">
                  <div className="font-medium text-foreground">{p.title}</div>
                  <div className="mt-0.5 text-xs text-muted">{p.desc}</div>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>资源</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-56">
              {["文档中心", "组件库", "更新日志", "状态页"].map((t) => (
                <li key={t}>
                  <NavigationMenuLink href="#" className="block px-3 py-2">
                    {t}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="#pricing">价格</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export const navigationMenuShowcase: ShowcaseSpec = {
  controls: [{ prop: "delay", type: "number", defaultValue: 100, label: "悬停开启延迟(ms)" }],
  states: [
    { name: "导航菜单（产品 mega 面板 / 资源列表 / 价格纯链接）", render: () => <Demo /> },
    { name: "零延迟（hover 即开）", render: () => <Demo delay={0} /> },
  ],
  renderWithProps: (p) => <Demo delay={Number(p.delay) || 0} />,
  toCode: () =>
    `<NavigationMenu>\n  <NavigationMenuList>\n    <NavigationMenuItem value="products">\n      <NavigationMenuTrigger>产品</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink 列表 */}</div>\n      </NavigationMenuContent>\n    </NavigationMenuItem>\n    <NavigationMenuItem value="pricing">\n      <NavigationMenuLink href="/pricing">价格</NavigationMenuLink>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`,
};
