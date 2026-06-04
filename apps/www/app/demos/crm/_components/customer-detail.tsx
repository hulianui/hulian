"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Descriptions,
  DrawerForm,
  Empty,
  Field,
  List,
  ListItem,
  ListItemMeta,
  PageHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Tag,
  Textarea,
  Timeline,
  useForm,
  type TimelineDotColor,
} from "@hulian/ui";
import { customerById } from "../_data/customers";
import { followsByCustomer } from "../_data/follows";
import { opportunities } from "../_data/opportunities";
import { orders } from "../_data/orders";
import { customerLevelTone, customerStatusTone, oppStageTone, orderStatusTone, yuan } from "../_data/status";
import type { Follow, FollowType } from "../_data/types";

const FOLLOW_TYPES: FollowType[] = ["电话", "拜访", "微信", "邮件"];
const followDot: Record<FollowType, TimelineDotColor> = {
  电话: "primary",
  拜访: "success",
  微信: "default",
  邮件: "warning",
};

export function CustomerDetail({ id }: { id: string }) {
  const router = useRouter();
  const customer = customerById(id);

  const [followList, setFollowList] = useState<Follow[]>(() => followsByCustomer(id));
  const [open, setOpen] = useState(false);
  const form = useForm<{ type: string; content: string }>({ initialValues: { type: "电话", content: "" } });
  const typeField = form.register("type");
  const contentField = form.register("content", { rules: [{ required: true, message: "请填写跟进内容" }] });

  const opps = useMemo(() => opportunities.filter((o) => o.customerId === id), [id]);
  const ords = useMemo(() => orders.filter((o) => o.customerId === id), [id]);

  if (!customer) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Empty title="客户不存在" description="可能已被删除（demo 内存态，刷新还原）。">
          <Button onClick={() => router.push("/demos/crm/customers")}>返回客户列表</Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={customer.name}
        subTitle={customer.company}
        onBack={() => router.push("/demos/crm/customers")}
        tags={
          <div className="flex items-center gap-2">
            <Tag tone={customerStatusTone[customer.status]} dot size="sm">
              {customer.status}
            </Tag>
            <Tag tone={customerLevelTone[customer.level]} size="sm">
              {customer.level}
            </Tag>
          </div>
        }
        extra={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              新增跟进
            </Button>
            <Button size="sm">编辑客户</Button>
          </>
        }
      />

      <Card variant="outline">
        <CardBody>
          <Descriptions
            column={3}
            items={[
              { label: "负责人", children: customer.owner },
              { label: "所属行业", children: customer.industry },
              { label: "所在地区", children: customer.region },
              { label: "联系人", children: customer.contactName },
              { label: "联系电话", children: <span className="tabular-nums">{customer.phone}</span> },
              { label: "邮箱", children: customer.email },
              { label: "累计成交", children: <span className="font-medium tabular-nums">{yuan(customer.amount)}</span> },
              { label: "最近跟进", children: customer.lastFollowAt },
              { label: "创建时间", children: customer.createdAt },
            ]}
          />
        </CardBody>
      </Card>

      <Card variant="outline">
        <CardBody>
          <Tabs defaultValue="follows">
            <TabsList>
              <TabsTab value="follows">跟进记录</TabsTab>
              <TabsTab value="opps">商机 · {opps.length}</TabsTab>
              <TabsTab value="orders">订单 · {ords.length}</TabsTab>
              <TabsTab value="files">附件</TabsTab>
            </TabsList>

            <TabsPanel value="follows" className="pt-5">
              {followList.length ? (
                <Timeline
                  items={followList.map((fw) => ({
                    label: `${fw.createdAt} · ${fw.owner}`,
                    color: followDot[fw.type],
                    children: (
                      <div className="flex flex-col gap-1 pb-1">
                        <Tag size="sm" variant="outline" className="w-fit">
                          {fw.type}
                        </Tag>
                        <span className="text-sm text-foreground">{fw.content}</span>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty title="暂无跟进记录" description="点击右上「新增跟进」记录第一条。" size="sm" />
              )}
            </TabsPanel>

            <TabsPanel value="opps" className="pt-5">
              {opps.length ? (
                <List
                  items={opps}
                  renderItem={(o) => (
                    <ListItem
                      actions={[
                        <Tag key="st" tone={oppStageTone[o.stage]} size="sm">
                          {o.stage}
                        </Tag>,
                        <span key="amt" className="text-sm font-medium tabular-nums">
                          {yuan(o.amount)}
                        </span>,
                      ]}
                    >
                      <ListItemMeta title={o.title} description={`负责人 ${o.owner} · 赢率 ${o.probability}% · 预计 ${o.expectedCloseAt}`} />
                    </ListItem>
                  )}
                />
              ) : (
                <Empty title="暂无商机" size="sm" />
              )}
            </TabsPanel>

            <TabsPanel value="orders" className="pt-5">
              {ords.length ? (
                <List
                  items={ords}
                  renderItem={(o) => (
                    <ListItem
                      actions={[
                        <Tag key="st" tone={orderStatusTone[o.status]} size="sm">
                          {o.status}
                        </Tag>,
                        <span key="amt" className="text-sm font-medium tabular-nums">
                          {yuan(o.amount)}
                        </span>,
                      ]}
                    >
                      <ListItemMeta title={<span className="tabular-nums">{o.orderNo}</span>} description={`${o.items} 件商品 · 下单于 ${o.createdAt}`} />
                    </ListItem>
                  )}
                />
              ) : (
                <Empty title="暂无订单" size="sm" />
              )}
            </TabsPanel>

            <TabsPanel value="files" className="pt-5">
              <Empty title="暂无附件" description="合同 / 报价单等可在此归档。" size="sm" />
            </TabsPanel>
          </Tabs>
        </CardBody>
      </Card>

      <DrawerForm
        title="新增跟进"
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => {
          setFollowList((prev) => [
            {
              id: `F${prev.length + 100}`,
              customerId: id,
              type: v.type as FollowType,
              content: String(v.content),
              owner: customer.owner,
              createdAt: "2026-06-04 12:00",
            },
            ...prev,
          ]);
          form.resetFields();
        }}
      >
        <Field label="跟进方式">
          <Select
            items={FOLLOW_TYPES.map((t) => ({ value: t, label: t }))}
            value={typeField.value as string}
            onValueChange={(v) => typeField.onChange(v as string)}
          >
            <SelectTrigger />
            <SelectContent>
              {FOLLOW_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="跟进内容" error={contentField.error}>
          <Textarea
            value={contentField.value as string}
            onChange={contentField.onChange}
            onBlur={contentField.onBlur}
            rows={4}
            placeholder="记录本次沟通要点、客户反馈、下一步计划…"
          />
        </Field>
      </DrawerForm>
    </div>
  );
}
