import { Avatar, Card, Heading, Tag, Text } from "@hulianui/ui";
const MEMBERS = [
    {
        name: "Chen Hang",
        fallback: "Chen",
        role: "Co-Founder & CEO",
        bio: "Former distributed systems architect who believes infrastructure should be invisible.",
    },
    {
        name: "Marco Reyes",
        fallback: "M",
        role: "Platform engineering manager",
        bio: "Expanded HanCloud's scheduler from one region to three continents.",
    },
    {
        name: "Lin Zhihua",
        fallback: "Lin",
        role: "Chief Designer",
        bio: "Leads the console and documentation systems, with a sharp eye for focused information density.",
    },
    {
        name: "Aisha Karim",
        fallback: "A",
        role: "Observability Technical Lead",
        bio: "Built a real-time distributed tracing pipeline that handles millions of telemetry points.",
    },
    {
        name: "Zhou Mubai",
        fallback: "Zhou",
        role: "Head of Elastic Compute",
        bio: "Turned multi-second cold starts into millisecond startup times.",
    },
    {
        name: "Daniel Osei",
        fallback: "D",
        role: "Developer Relations Manager",
        bio: "Connects our engineering team with the community in both directions.",
    },
    {
        name: "Su Wan",
        fallback: "Su",
        role: "Head of Security Engineering",
        bio: "Guards multi-tenant isolation boundaries and applies zero-trust principles to every line of configuration.",
    },
    {
        name: "Elena Volkov",
        fallback: "E",
        role: "Data Infrastructure Engineer",
        bio: "Maintains HanCloud's busiest internal event bus.",
    },
];
export function TeamGridBlock() {
    return (<section className="px-6 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <Tag variant="soft" tone="brand" size="sm">
            team
          </Tag>
          <Heading level={2} size="3xl" weight="bold" balance className="text-foreground">
            The people building HanCloud
          </Heading>
          <Text tone="muted" size="lg" className="max-w-2xl">
            A small but dedicated team across infrastructure, design and developer experience makes complex cloud capabilities simple and usable.
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBERS.map((m) => (<Card key={m.name} variant="outline" className="flex flex-col items-center gap-3 p-6 text-center">
              <Avatar size="lg" fallback={m.fallback}/>
              <div className="flex flex-col gap-1">
                <Text weight="medium" className="text-foreground">
                  {m.name}
                </Text>
                <Text size="xs" tone="muted">
                  {m.role}
                </Text>
              </div>
              <Text size="sm" tone="muted">
                {m.bio}
              </Text>
            </Card>))}
        </div>
      </div>
    </section>);
}
