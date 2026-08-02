import { copy } from "./page.content";
import { demoLocationHref } from "../../../_components/demo-locale";
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
  title: copy("contactUsHancloud"),
  description: copy("askAboutPlansBookADemoOrRequestAMigrationAssessmentLeaveYourDetailsAndWeWillReplyWithinOneBusine"),
};

const contactInfo = [
  { icon: Mail, label: copy("email"), value: "hello@hancloud.dev" },
  { icon: Phone, label: copy("phone"), value: "400-820-0000" },
  { icon: MapPin, label: copy("address"), value: copy("text32f100CenturyAvenuePudongShanghai") },
  { icon: Clock, label: copy("supportHours"), value: copy("weekdays9002100247ForEnterprise") },
];

export default function ContactPage() {
  return (
    <section className="px-6 pb-24 pt-12 sm:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        <Breadcrumb
          className="mb-8"
          items={[{ label: copy("home"), href: demoLocationHref("/demos/website") }, { label: copy("contactUs") }]}
        />

        <div className="mb-12 max-w-2xl">
          <Tag variant="soft" tone="brand" size="sm" className="mb-3">

            {copy("contactSales")}
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance className="text-foreground">

            {copy("tellUsAboutYourProject")}
          </Heading>
          <Text tone="muted" size="lg" className="mt-3">

            {copy("whetherYouAreEvaluatingAMigrationBookingADemoOrExploringEnterpriseCapabilitiesWeAreHereToHelp")}
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

                  {copy("otherWaysToReachUs")}
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

                  {copy("needTechnicalSupport")}
                </Heading>
                <Text tone="muted" size="sm" className="mt-1.5">

                  {copy("existingCustomersCanOpenATicketFromTheConsoleProPlansReceiveAResponseWithinFourHoursWhileEnterpr")}
                </Text>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
