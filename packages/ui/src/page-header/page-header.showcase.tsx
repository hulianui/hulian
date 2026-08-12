"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PageHeader } from "./page-header";
import { Breadcrumb } from "../breadcrumb";
import { Button } from "../button";
import { Chip } from "../chip";
import { Tabs, TabsList, TabsTab } from "../tabs";

const crumb = (
  <Breadcrumb
    items={[
      { label: "首页", href: "#" },
      { label: "订单", href: "#" },
      { label: "订单详情" },
    ]}
  />
);

const tags = (
  <>
    <Chip tone="brand" variant="soft" size="sm">
      进行中
    </Chip>
    <Chip tone="neutral" variant="outline" size="sm">
      已付款
    </Chip>
  </>
);

const actions = (
  <>
    <Button variant="ghost" size="sm">
      导出
    </Button>
    <Button variant="solid" size="sm">
      编辑
    </Button>
  </>
);

const tabsFooter = (
  <Tabs defaultValue="detail">
    <TabsList>
      <TabsTab value="detail">详情</TabsTab>
      <TabsTab value="items">商品</TabsTab>
      <TabsTab value="logistics">物流</TabsTab>
    </TabsList>
  </Tabs>
);

export const pageHeaderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "极简（仅标题 + 操作）",
      description: "最常见的列表页头：左侧标题，右侧主操作按钮。",
      code: `<PageHeader
  title="用户管理"
  extra={<Button variant="solid" size="sm">新建用户</Button>}
/>`,
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            title="用户管理"
            extra={
              <Button variant="solid" size="sm">
                新建用户
              </Button>
            }
          />
        </div>
      ),
    },
    {
      title: "面包屑 + 副标题 + 标签",
      description: "breadcrumb 渲染在标题上方，subTitle 与 tags 贴在标题右侧。",
      code: `<PageHeader
  breadcrumb={<Breadcrumb items={[{ label: "首页", href: "/" }, { label: "商品列表" }]} />}
  title="商品列表"
  subTitle="管理在售与下架商品"
  tags={<Chip tone="brand" variant="soft" size="sm">128 在售</Chip>}
/>`,
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            breadcrumb={
              <Breadcrumb
                items={[{ label: "首页", href: "#" }, { label: "商品列表" }]}
              />
            }
            title="商品列表"
            subTitle="管理在售与下架商品"
            tags={
              <Chip tone="brand" variant="soft" size="sm">
                128 在售
              </Chip>
            }
          />
        </div>
      ),
    },
    {
      title: "详情页（返回 + Tabs 页脚 + 分隔线）",
      description: "传入 onBack 渲染返回箭头；footer 常放 Tabs；bordered 在底部加分隔线。",
      code: `<PageHeader
  onBack={() => router.back()}
  breadcrumb={<Breadcrumb items={items} />}
  title="订单 #20260603-8821"
  subTitle="共 6 件商品"
  tags={<Chip tone="brand" variant="soft" size="sm">进行中</Chip>}
  extra={<><Button variant="ghost" size="sm">导出</Button><Button variant="solid" size="sm">编辑</Button></>}
  footer={
    <Tabs defaultValue="detail">
      <TabsList>
        <TabsTab value="detail">详情</TabsTab>
        <TabsTab value="items">商品</TabsTab>
        <TabsTab value="logistics">物流</TabsTab>
      </TabsList>
    </Tabs>
  }
  bordered
/>`,
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            onBack={() => {}}
            breadcrumb={crumb}
            title="订单 #20260603-8821"
            subTitle="共 6 件商品"
            tags={tags}
            extra={actions}
            footer={tabsFooter}
            bordered
          />
        </div>
      ),
    },
    {
      title: "元信息行",
      description:
        "meta 是标题下那串用分隔符串起来的事实值；空项自动跳过，因此某项缺值时不会留下孤零零一个分隔符。",
      code: `<PageHeader
  title="张三"
  meta={[
    "330106…512",
    "男",
    segments && \`\${segments} 段社保\`, // 无值时整项消失，不留孤点
    companyCount ? \`\${companyCount} 家公司\` : null,
    "最近参保单位：杭州美风科技有限公司",
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            title="张三"
            tags={
              <Chip tone="brand" variant="soft" size="sm">
                在保
              </Chip>
            }
            meta={[
              "330106…512",
              "男",
              "3 段社保",
              null, // 无值的项：不产生分隔符
              "2 家公司",
              "最近参保单位：杭州美风科技有限公司",
            ]}
          />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "onBack", type: "boolean", defaultValue: true, label: "返回按钮" },
    { prop: "bordered", type: "boolean", defaultValue: true, label: "底部分隔线" },
  ],
  states: [
    {
      name: "完整页头（返回 + 面包屑 + 标签 + 操作 + Tabs 页脚 + 分隔线）",
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            onBack={() => {}}
            breadcrumb={crumb}
            title="订单 #20260603-8821"
            subTitle="共 6 件商品"
            tags={tags}
            extra={actions}
            footer={tabsFooter}
            bordered
          />
        </div>
      ),
    },
    {
      name: "极简（仅标题 + 操作）",
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            title="用户管理"
            extra={
              <Button variant="solid" size="sm">
                新建用户
              </Button>
            }
          />
        </div>
      ),
    },
    {
      name: "元信息行（含一个空项，不留孤点）",
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            title="张三"
            meta={["330106…512", "男", "3 段社保", null, "2 家公司"]}
          />
        </div>
      ),
    },
    {
      name: "列表页（面包屑 + 标题 + 标签，无返回）",
      render: () => (
        <div className="w-full max-w-3xl">
          <PageHeader
            breadcrumb={
              <Breadcrumb
                items={[{ label: "首页", href: "#" }, { label: "商品列表" }]}
              />
            }
            title="商品列表"
            subTitle="管理在售与下架商品"
            tags={
              <Chip tone="brand" variant="soft" size="sm">
                128 在售
              </Chip>
            }
          />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-3xl">
      <PageHeader
        onBack={p.onBack ? () => {} : undefined}
        breadcrumb={crumb}
        title="订单 #20260603-8821"
        subTitle="共 6 件商品"
        tags={tags}
        extra={actions}
        footer={tabsFooter}
        bordered={Boolean(p.bordered)}
      />
    </div>
  ),
  toCode: (p) =>
    [
      "<PageHeader",
      p.onBack ? "  onBack={() => router.back()}" : null,
      "  breadcrumb={<Breadcrumb items={items} />}",
      '  title="订单 #20260603-8821"',
      '  subTitle="共 6 件商品"',
      '  tags={<Chip tone="brand" variant="soft">进行中</Chip>}',
      "  extra={<Button>编辑</Button>}",
      "  footer={<Tabs>…</Tabs>}",
      p.bordered ? "  bordered" : null,
      "/>",
    ]
      .filter(Boolean)
      .join("\n"),
};
