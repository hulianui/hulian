import { Heading, Text, Tag } from "@hulianui/ui";
import { BlogListBlock } from "../../blocks/_blocks/blog-list.en";
export function BlogPage() {
    return (<div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            HanCloud Blog
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            Engineering practice, product thinking, and industry perspectives
          </Heading>
          <Text tone="muted" size="lg">
            Practical lessons and long-term thinking from the HanCloud team.
          </Text>
        </div>
      </section>
      <BlogListBlock />
    </div>);
}
