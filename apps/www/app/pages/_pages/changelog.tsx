import { Heading, Text, Tag } from "@hulianui/ui";
import { ChangelogBlock } from "../../blocks/_blocks/changelog";

// 更新日志页 —— 紧凑页头 + 版本时间线,透明传达迭代节奏。
export function ChangelogPage() {
  return (
    <div className="bg-bg">
      <section className="px-6 pt-20 pb-6 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          <Tag variant="soft" tone="brand" size="sm">
            更新日志
          </Tag>
          <Heading level={1} size="4xl" weight="bold" balance>
            我们持续在变好
          </Heading>
          <Text tone="muted" size="lg">
            每一次更新,都是为了让瀚云更顺手、更可靠。
          </Text>
        </div>
      </section>
      <ChangelogBlock />
    </div>
  );
}
