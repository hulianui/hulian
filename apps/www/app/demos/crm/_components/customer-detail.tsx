"use client";
import { copy } from "./customer-detail.content";

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
  toast,
  useForm,
  type TimelineDotColor,
} from "@hulianui/ui";
import { customerById } from "../_data/customers";
import { followsByCustomer } from "../_data/follows";
import { opportunities } from "../_data/opportunities";
import { orders } from "../_data/orders";
import { customerIndustryLabel, customerLevelLabel, customerLevelTone, customerOwnerLabel, customerStatusLabel, customerStatusTone, followTypeLabel, oppStageLabel, oppStageTone, orderStatusLabel, orderStatusTone, yuan } from "../_data/status";
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
  const contentField = form.register("content", { rules: [{ required: true, message: copy("pleaseFillInTheFollowUpContent") }] });

  const opps = useMemo(() => opportunities.filter((o) => o.customerId === id), [id]);
  const ords = useMemo(() => orders.filter((o) => o.customerId === id), [id]);

  if (!customer) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Empty title={copy("customerDoesNotExist")} description={copy("itMayHaveBeenDeletedDemoMemory")}>
          <Button onClick={() => router.push("/demos/crm/customers")}>{copy("returnToCustomerList")}</Button>
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
              {customerStatusLabel[customer.status]}
            </Tag>
            <Tag tone={customerLevelTone[customer.level]} size="sm">
              {customerLevelLabel[customer.level]}
            </Tag>
          </div>
        }
        extra={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{copy("addFollowUp")}</Button>
            <Button
              size="sm"
              onClick={() => toast({ title: copy("editCustomer"), description: copy("demoEnvironmentEditTheEntranceAndSee"), tone: "neutral" })}
            >{copy("editCustomer2")}</Button>
          </>
        }
      />

      <Card variant="outline">
        <CardBody>
          <Descriptions
            column={3}
            items={[
              { label: copy("personInCharge"), children: customerOwnerLabel[customer.owner] },
              { label: copy("industry"), children: customerIndustryLabel[customer.industry] },
              { label: copy("area"), children: customer.region },
              { label: copy("contactPerson"), children: customer.contactName },
              { label: copy("contactNumber"), children: <span className="tabular-nums">{customer.phone}</span> },
              { label: copy("email"), children: customer.email },
              { label: copy("accumulatedTransactions"), children: <span className="font-medium tabular-nums">{yuan(customer.amount)}</span> },
              { label: copy("latestFollowUp"), children: customer.lastFollowAt },
              { label: copy("creationTime"), children: customer.createdAt },
            ]}
          />
        </CardBody>
      </Card>

      <Card variant="outline">
        <CardBody>
          <Tabs defaultValue="follows">
            <TabsList>
              <TabsTab value="follows">{copy("followUpRecords")}</TabsTab>
              <TabsTab value="opps">{copy("businessOpportunities")}{opps.length}</TabsTab>
              <TabsTab value="orders">{copy("order")}{ords.length}</TabsTab>
              <TabsTab value="files">{copy("accessories")}</TabsTab>
            </TabsList>

            <TabsPanel value="follows" className="pt-5">
              {followList.length ? (
                <Timeline
                  items={followList.map((fw) => ({
                    label: `${fw.createdAt} · ${customerOwnerLabel[fw.owner]}`,
                    color: followDot[fw.type],
                    children: (
                      <div className="flex flex-col gap-1 pb-1">
                        <Tag size="sm" variant="outline" className="w-fit">
                          {followTypeLabel[fw.type]}
                        </Tag>
                        <span className="text-sm text-foreground">{fw.content}</span>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <Empty title={copy("noFollowUpRecordYet")} description={copy("clickAddFollowUpOnTheUpper")} size="sm" />
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
                          {oppStageLabel[o.stage]}
                        </Tag>,
                        <span key="amt" className="text-sm font-medium tabular-nums">
                          {yuan(o.amount)}
                        </span>,
                      ]}
                    >
                      <ListItemMeta title={o.title} description={copy("personInChargeValueWinRateValue", customerOwnerLabel[o.owner], o.probability, o.expectedCloseAt)} />
                    </ListItem>
                  )}
                />
              ) : (
                <Empty title={copy("noBusinessOpportunitiesYet")} size="sm" />
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
                          {orderStatusLabel[o.status]}
                        </Tag>,
                        <span key="amt" className="text-sm font-medium tabular-nums">
                          {yuan(o.amount)}
                        </span>,
                      ]}
                    >
                      <ListItemMeta title={<span className="tabular-nums">{o.orderNo}</span>} description={copy("valueItemsOrderedOnValue", o.items, o.createdAt)} />
                    </ListItem>
                  )}
                />
              ) : (
                <Empty title={copy("noOrdersYet")} size="sm" />
              )}
            </TabsPanel>

            <TabsPanel value="files" className="pt-5">
              <Empty title={copy("noAttachmentsYet")} description={copy("contractsQuotesEtcCanBeFiledHere")} size="sm" />
            </TabsPanel>
          </Tabs>
        </CardBody>
      </Card>

      <DrawerForm
        title={copy("addFollowUp2")}
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
          toast({ title: copy("followUpRecorded"), description: `${customer.name} · ${followTypeLabel[v.type as FollowType]}`, tone: "success" });
        }}
      >
        <Field label={copy("followUpMethod")}>
          <Select
            items={FOLLOW_TYPES.map((t) => ({ value: t, label: followTypeLabel[t] }))}
            value={typeField.value as string}
            onValueChange={(v) => typeField.onChange(v as string)}
          >
            <SelectTrigger />
            <SelectContent>
              {FOLLOW_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {followTypeLabel[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={copy("followUpContent")} error={contentField.error}>
          <Textarea
            value={contentField.value as string}
            onChange={contentField.onChange}
            onBlur={contentField.onBlur}
            rows={4}
            placeholder={copy("recordTheKeyPointsOfThisCommunication")}
          />
        </Field>
      </DrawerForm>
    </div>
  );
}
