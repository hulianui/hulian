"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, } from "../../../../packages/ui/src/navigation-menu/navigation-menu";
const products = [
    { title: "Data Platform", desc: "Metadata-driven low-code engine" },
    { title: "Workflow", desc: "Desktop RPA and Evidence Automation" },
    { title: "Intra-city service", desc: "Housekeeping service applet matrix" },
    { title: "Community interaction", desc: "Local life content platform" },
];
function Demo({ delay = 100 }: {
    delay?: number;
}) {
    return (<NavigationMenu delay={delay}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[28rem] grid-cols-2 gap-1">
              {products.map((p) => (<NavigationMenuLink key={p.title} href="#" className="block px-3 py-2">
                  <div className="font-medium text-foreground">{p.title}</div>
                  <div className="mt-0.5 text-xs text-muted">{p.desc}</div>
                </NavigationMenuLink>))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-56">
              {["Document Center", "Component Library", "Update log", "Status Page"].map((t) => (<li key={t}>
                  <NavigationMenuLink href="#" className="block px-3 py-2">
                    {t}
                  </NavigationMenuLink>
                </li>))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuLink href="https://example.com/#pricing">Price</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>);
}
export const navigationMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Trigger + Content combination hover to expand the shared floating layer; pure link items are directly placed in Link without Content.",
            code: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="resources">
      <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="w-56">
          <li><NavigationMenuLink href="#" className="block px-3 py-2">Document Center</NavigationMenuLink></li>
          <li><NavigationMenuLink href="#" className="block px-3 py-2">Component library</NavigationMenuLink></li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem value="pricing">
      <NavigationMenuLink href="https://example.com/#pricing">Price</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
            render: () => (<NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="resources">
              <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="w-56">
                  {["Document Center", "Component Library", "Update log", "Status Page"].map((t) => (<li key={t}>
                      <NavigationMenuLink href="#" className="block px-3 py-2">
                        {t}
                      </NavigationMenuLink>
                    </li>))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem value="pricing">
              <NavigationMenuLink href="https://example.com/#pricing">Price</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>),
        },
        {
            title: "Mega panel",
            description: "Content has free layout, and you can place a multi-column card grid to make a large navigation panel, and the panel size automatically deforms with the content.",
            code: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Product</NavigationMenuTrigger>
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
  </NavigationMenuList>
</NavigationMenu>`,
            render: () => (<NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid w-[28rem] grid-cols-2 gap-1">
                  {products.map((p) => (<NavigationMenuLink key={p.title} href="#" className="block px-3 py-2">
                      <div className="font-medium text-foreground">{p.title}</div>
                      <div className="mt-0.5 text-xs text-muted">{p.desc}</div>
                    </NavigationMenuLink>))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>),
        },
        {
            title: "Zero delay on",
            description: "delay={0} opens on hover, without opening delay.",
            code: `<NavigationMenu delay={0}>{/* ...List */}</NavigationMenu>`,
            render: () => <Demo delay={0}/>,
        },
    ],
    controls: [{ prop: "delay", type: "number", defaultValue: 100, label: "Hover start delay (ms)" }],
    states: [
        { name: "Navigation menu (Product mega Panel / Resource List / Price Pure Link)", render: () => <Demo /> },
        { name: "Zero delay (hover opens immediately)", render: () => <Demo delay={0}/> },
    ],
    renderWithProps: (p) => <Demo delay={Number(p.delay) || 0}/>,
    toCode: () => `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Product</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink list */}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem value="pricing">
      <NavigationMenuLink href="/pricing">Price</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
};
