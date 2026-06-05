import type { Metadata } from "next";
import {
  Card,
  CardBody,
  Heading,
  Text,
  Tag,
  Breadcrumb,
  Stack,
  Divider,
} from "@hulianui/ui";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { ContactForm } from "../../_components/contact-form";

export const metadata: Metadata = {
  title: "联系我们 · 瀚云 HanCloud",
  description: "了解套餐、预约演示或获取迁移评估——留下信息，我们一个工作日内回复。",
};

const contactInfo = [
  { icon: Mail, label: "邮箱", value: "hello@hancloud.dev" },
  { icon: Phone, label: "电话", value: "400-820-0000" },
  { icon: MapPin, label: "地址", value: "上海市浦东新区世纪大道 100 号 32 层" },
  { icon: Clock, label: "服务时间", value: "工作日 9:00 – 21:00（企业版 7×24）" },
];

export default function ContactPage() {
  return (
    <section className="px-6 pb-24 pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <Breadcrumb
          className="mb-8"
          items={[{ label: "首页", href: "/demos/website" }, { label: "联系我们" }]}
        />

        <div className="mb-12 max-w-2xl">
          <Tag variant="soft" tone="brand" size="sm" className="mb-3">
            联系销售
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">
            聊聊你的项目
          </Heading>
          <Text tone="muted" size="lg" className="mt-3">
            无论是评估迁移、预约演示，还是想了解企业版能力，我们都很乐意提供帮助。
          </Text>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Card variant="outline">
            <CardBody className="p-6 sm:p-8">
              <ContactForm />
            </CardBody>
          </Card>

          <div className="flex flex-col gap-6">
            <Card variant="elevated">
              <CardBody className="p-6">
                <Heading level={2} size="lg" weight="semibold" className="mb-4 text-foreground">
                  其他联系方式
                </Heading>
                <Stack direction="column" gap={4}>
                  {contactInfo.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label}>
                        <Stack direction="row" align="start" gap={3}>
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary">
                            <Icon className="size-4" aria-hidden />
                          </span>
                          <div>
                            <Text size="xs" tone="muted">
                              {item.label}
                            </Text>
                            <Text weight="medium" className="mt-0.5">
                              {item.value}
                            </Text>
                          </div>
                        </Stack>
                        {i < contactInfo.length - 1 && <Divider className="mt-4" />}
                      </div>
                    );
                  })}
                </Stack>
              </CardBody>
            </Card>

            <Card variant="outline" className="bg-surface/40">
              <CardBody className="p-6">
                <Heading level={3} size="sm" weight="semibold" className="text-foreground">
                  寻求技术支持？
                </Heading>
                <Text tone="muted" size="sm" className="mt-1.5">
                  现有客户可在控制台内提交工单，专业版 4 小时响应，企业版配备专属客户成功经理。
                </Text>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
