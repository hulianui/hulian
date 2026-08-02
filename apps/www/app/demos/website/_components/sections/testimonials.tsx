import { copy } from "./testimonials.content";
import { Marquee, Card, CardBody, Avatar, Text } from "@hulianui/ui";
import { Section } from "../section";
import { testimonials, type Testimonial } from "../../_data/site";

function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <Card variant="outline" className="w-[340px] shrink-0">
      <CardBody className="flex flex-col gap-4 p-5">
        <Text className="leading-relaxed">{copy("text")}{t.quote}{copy("text2")}</Text>
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={t.initial} />
          <div className="min-w-0">
            <Text size="sm" weight="medium">
              {t.name}
            </Text>
            <Text size="xs" tone="muted" truncate>
              {t.title}
            </Text>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// 客户证言：上下两行 Marquee 反向滚动的引言卡。
export function Testimonials() {
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3);
  return (
    <Section
      id="testimonials"
      eyebrow={copy("whatCustomersSay")}
      title={copy("trustedByTeamsThatCareAboutCraft")}
      subtitle={copy("fromStartupsToPublicCompaniesTeamsUseHancloudToShipIdeasFasterAndMoreReliably")}
    >
      <div className="flex flex-col gap-5">
        <Marquee pauseOnHover duration={40} gap="1.25rem">
          {row1.map((t) => (
            <QuoteCard key={t.name} t={t} />
          ))}
        </Marquee>
        <Marquee pauseOnHover direction="right" duration={40} gap="1.25rem">
          {row2.map((t) => (
            <QuoteCard key={t.name} t={t} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
}
