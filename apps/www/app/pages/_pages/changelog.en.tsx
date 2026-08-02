import { Heading, Text, Tag } from "@hulianui/ui";
import { ChangelogBlock } from "../../blocks/_blocks/changelog.en";
export function ChangelogPage() {
    return (<div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            Changelog
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            Always improving
          </Heading>
          <Text tone="muted" size="lg">
            Every update makes HanCloud easier to use and more dependable.
          </Text>
        </div>
      </section>
      <ChangelogBlock />
    </div>);
}
