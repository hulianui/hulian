import { Marquee, Card, CardBody, Avatar, Heading, Tag, Text } from "@hulianui/ui";
interface Testimonial {
    quote: string;
    name: string;
    title: string;
    initial: string;
}
const TESTIMONIALS: Testimonial[] = [
    {
        quote: "After moving to HanCloud, we went from one release a week to more than ten a day, and our on-call engineers can roll back with confidence.",
        name: "Chen Hang",
        title: "Aurora Technology \u00B7 Engineering VP",
        initial: "Chen",
    },
    {
        quote: "Scaling elastic compute to zero when idle cut our staging bill by 70%.",
        name: "Lin Yue",
        title: "Yuntu Data \u00B7 Head of Infrastructure",
        initial: "Lin",
    },
    {
        quote: "Observability works out of the box, so new engineers can trace production issues on day one without building a telemetry stack first.",
        name: "Marco Reyes",
        title: "Northwind \u00B7 Platform Lead",
        initial: "M",
    },
    {
        quote: "Global edge nodes cut initial page load time for international users from 1.8 s to 0.4 s, with a clear lift in conversion.",
        name: "Su Qing",
        title: "FarSail Global \u00B7 CTO",
        initial: "Su",
    },
    {
        quote: "Compliance used to consume an engineer's entire quarter. HanCloud's audit trail and managed keys helped us pass the security assessment on the first attempt.",
        name: "Zhao Mingyuan",
        title: "Wenxin Financial \u00B7 Security Director",
        initial: "Zhao",
    },
    {
        quote: "The same workflow took us from demo to production. HanCloud stays out of the way better than any platform we've used.",
        name: "Aisha Khan",
        title: "Lumen AI \u00B7 Head of Eng",
        initial: "A",
    },
];
function QuoteCard({ t }: {
    t: Testimonial;
}) {
    return (<Card variant="outline" className="w-[340px] shrink-0">
      <CardBody className="flex flex-col gap-4 p-5">
        <Text className="leading-relaxed">"{t.quote}"</Text>
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback={t.initial}/>
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
    </Card>);
}
export function TestimonialsBlock() {
    const row1 = TESTIMONIALS.slice(0, 3);
    const row2 = TESTIMONIALS.slice(3);
    return (<section id="testimonials" className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            What customers say
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            Trusted by teams that care about craft
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            From startups to public companies, teams use HanCloud to ship ideas faster and more reliably.
          </Text>
        </div>
        <div className="flex flex-col gap-5">
          <Marquee pauseOnHover duration={40} gap="1.25rem">
            {row1.map((t) => (<QuoteCard key={t.name} t={t}/>))}
          </Marquee>
          <Marquee pauseOnHover direction="right" duration={40} gap="1.25rem">
            {row2.map((t) => (<QuoteCard key={t.name} t={t}/>))}
          </Marquee>
        </div>
      </div>
    </section>);
}
