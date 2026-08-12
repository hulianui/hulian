"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PageHeader } from "../../../../packages/ui/src/page-header/page-header";
import { Breadcrumb } from "../../../../packages/ui/src/breadcrumb";
import { Button } from "../../../../packages/ui/src/button";
import { Chip } from "../../../../packages/ui/src/chip";
import { Tabs, TabsList, TabsTab } from "../../../../packages/ui/src/tabs";
const crumb = (<Breadcrumb items={[
        { label: "Home", href: "#" },
        { label: "Order", href: "#" },
        { label: "Order details" },
    ]}/>);
const tags = (<>
    <Chip tone="brand" variant="soft" size="sm">
      Ongoing
    </Chip>
    <Chip tone="neutral" variant="outline" size="sm">
      Paid
    </Chip>
  </>);
const actions = (<>
    <Button variant="ghost" size="sm">
      Export
    </Button>
    <Button variant="solid" size="sm">
      Edit
    </Button>
  </>);
const tabsFooter = (<Tabs defaultValue="detail">
    <TabsList>
      <TabsTab value="detail">Details</TabsTab>
      <TabsTab value="items">Product</TabsTab>
      <TabsTab value="logistics">Logistics</TabsTab>
    </TabsList>
  </Tabs>);
export const pageHeaderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Minimalist (only title + action)",
            description: "The most common list header: title on the left, main action button on the right.",
            code: `<PageHeader
  title="User Management"
  extra={<Button variant="solid" size="sm">New user</Button>}
/>`,
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader title="User Management" extra={<Button variant="solid" size="sm">
                Create new user
              </Button>}/>
        </div>),
        },
        {
            title: "Breadcrumbs + subtitles + tags",
            description: "breadcrumb is rendered above the title, and subTitle and tags are pasted to the right of the title.",
            code: `<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Product List" }]} />}
  title="Product List"
  subTitle="Manage on-sale and off-shelf products"
  tags={<Chip tone="brand" variant="soft" size="sm">128 For sale</Chip>}
/>`,
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader breadcrumb={<Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Product List" }]}/>} title="Product List" subTitle="Manage on-sale and off-the-shelf products" tags={<Chip tone="brand" variant="soft" size="sm">
                128 for sale
              </Chip>}/>
        </div>),
        },
        {
            title: "Details page (return + Tabs footer + divider)",
            description: "Pass in onBack to render the return arrow; footer always puts Tabs; bordered adds a divider line at the bottom.",
            code: `<PageHeader
  onBack={() => router.back()}
  breadcrumb={<Breadcrumb items={items} />}
  title="Order #20260603-8821"
  subTitle="6 items in total"
  tags={<Chip tone="brand" variant="soft" size="sm">In progress</Chip>}
  extra={<><Button variant="ghost" size="sm">Export</Button><Button variant="solid" size="sm">Edit</Button></>}
  footer={
    <Tabs defaultValue="detail">
      <TabsList>
        <TabsTab value="detail">Details</TabsTab>
        <TabsTab value="items">Product</TabsTab>
        <TabsTab value="logistics">Logistics</TabsTab>
      </TabsList>
    </Tabs>
  }
  bordered
/>`,
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader onBack={() => { }} breadcrumb={crumb} title="Order #20260603-8821" subTitle="6 items in total" tags={tags} extra={actions} footer={tabsFooter} bordered/>
        </div>),
        },
        {
            title: "Meta row",
            description: "meta is the run of factual values under the title joined by a separator. Empty items are skipped, so a missing value never leaves an orphan separator behind.",
            code: `<PageHeader
  title="Zhang San"
  meta={[
    "330106\u2026512",
    "Male",
    segments && \`\${segments} insurance periods\`, // no value drops the whole item, leaving no orphan separator
    companyCount ? \`\${companyCount} companies\` : null,
    "Latest employer: Hangzhou Meifeng Technology Co., Ltd.",
  ]}
/>`,
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader title="Zhang San" tags={<Chip tone="brand" variant="soft" size="sm">
                Active
              </Chip>} meta={[
                    "330106\u2026512",
                    "Male",
                    "3 insurance periods",
                    null,
                    "2 companies",
                    "Latest employer: Hangzhou Meifeng Technology Co., Ltd.",
                ]}/>
        </div>),
        },
    ],
    controls: [
        { prop: "onBack", type: "boolean", defaultValue: true, label: "Back button" },
        { prop: "bordered", type: "boolean", defaultValue: true, label: "Bottom divider" },
    ],
    states: [
        {
            name: "Full header (back + breadcrumbs + tags + actions + Tabs footer + divider)",
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader onBack={() => { }} breadcrumb={crumb} title="Order #20260603-8821" subTitle="6 items in total" tags={tags} extra={actions} footer={tabsFooter} bordered/>
        </div>),
        },
        {
            name: "Minimalist (only title + action)",
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader title="User Management" extra={<Button variant="solid" size="sm">
                Create new user
              </Button>}/>
        </div>),
        },
        {
            name: "Meta row (one empty item, no orphan separator)",
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader title="Zhang San" meta={["330106\u2026512", "Male", "3 insurance periods", null, "2 companies"]}/>
        </div>),
        },
        {
            name: "List page (breadcrumbs + title + tags, no return)",
            render: () => (<div className="w-full max-w-3xl">
          <PageHeader breadcrumb={<Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Product List" }]}/>} title="Product List" subTitle="Manage on-sale and off-the-shelf products" tags={<Chip tone="brand" variant="soft" size="sm">
                128 for sale
              </Chip>}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-full max-w-3xl">
      <PageHeader onBack={p.onBack ? () => { } : undefined} breadcrumb={crumb} title="Order #20260603-8821" subTitle="6 items in total" tags={tags} extra={actions} footer={tabsFooter} bordered={Boolean(p.bordered)}/>
    </div>),
    toCode: (p) => [
        "<PageHeader",
        p.onBack ? "  onBack={() => router.back()}" : null,
        "  breadcrumb={<Breadcrumb items={items} />}",
        "  title=\"Order #20260603-8821\"",
        "  subTitle=\"6 items in total\"",
        "  tags={<Chip tone=\"brand\" variant=\"soft\">In progress</Chip>}",
        "  extra={<Button>Edit</Button>}",
        "  footer={<Tabs>\u2026</Tabs>}",
        p.bordered ? "  bordered" : null,
        "/>",
    ]
        .filter(Boolean)
        .join("\n"),
};
