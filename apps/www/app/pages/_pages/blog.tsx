/** @jsxImportSource ../../../lib/fixture-jsx */
import { Heading, Text, Tag } from "@hulianui/ui";
import { BlogListBlock } from "../../blocks/_blocks/blog-list";

// 博客列表页 —— 紧凑页头 + 文章列表,内容沉淀与品牌输出。
export function BlogPage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            瀚云博客
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            工程实践、产品思考与行业观察
          </Heading>
          <Text tone="muted" size="lg">
            来自瀚云团队的一手经验与长期主义思考。
          </Text>
        </div>
      </section>
      <BlogListBlock />
    </div>
  );
}
