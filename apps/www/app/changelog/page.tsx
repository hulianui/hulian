import type { Metadata } from "next";
import { Tag, Text } from "@hulianui/ui";
import { SiteNavbar } from "../../components/site-navbar";
import { getIntlayer } from "next-intlayer";
import { UI_VERSION } from "../../lib/ui-version";
import changelog from "../../lib/changelog.json";
import changelogEn from "../../lib/changelog.en.json";
import { ChangelogView, type Release } from "./changelog-view";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("changelog", DOCS_LOCALE);

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.metadataDescription}`,
};

const REPO = "https://github.com/hulianui/hulian";

export default function ChangelogPage() {
  const releases = (DOCS_LOCALE === "en" ? changelogEn : changelog) as Release[];

  return (
    <>
      <SiteNavbar />
      {/* 比其它页宽（max-w-5xl 而非 3xl）：要在正文左侧容下粘性版本目录，
          正文本身仍收在可读行宽内（由 ChangelogView 的 flex-1 承担）。 */}
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-10">
        <header className="pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            {content.eyebrow}
          </p>
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight">{content.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{content.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="flex items-center gap-2">
              <Text size="sm" tone="muted">
                {content.currentVersion}
              </Text>
              <Tag variant="soft" tone="brand" size="sm">
                v{UI_VERSION}
              </Tag>
            </span>
            <a
              className="text-primary hover:underline"
              href="https://www.npmjs.com/package/@hulianui/ui"
              target="_blank"
              rel="noreferrer"
            >
              npm
            </a>
            <a
              className="text-primary hover:underline"
              href={`${REPO}/releases`}
              target="_blank"
              rel="noreferrer"
            >
              GitHub Releases
            </a>
          </div>
        </header>

        <ChangelogView releases={releases} currentVersion={UI_VERSION} />
      </main>
    </>
  );
}
