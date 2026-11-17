import { manifest } from "./manifest";
import { basePathForLocale } from "./docs-locale";
import { SITE_URL } from "./site";

const total = manifest.length;
// 英文文档站的根地址：英文作根语言时就是站点根，将来若改作嵌套语言会自动带上前缀。
const EN_BASE = `${SITE_URL}${basePathForLocale("en")}`;

export const AI_GUIDE_EN_MD = `# Hulian UI (@hulianui/ui) AI Integration Guide

> Give this complete guide to your AI coding assistant, such as Claude Code, Cursor, or Copilot, so it can build interfaces correctly with Hulian UI.

Hulian UI is a production-ready React design system with ${total} components. Every component is exported from \`@hulianui/ui\` and uses the shared design tokens.

## Install

\`\`\`bash
pnpm add @hulianui/ui @hulianui/tokens
\`\`\`

\`@hulianui/tokens\` provides the required theme CSS. Install it together with \`@hulianui/ui\`.

Peer dependencies: \`react>=18\` \`react-dom>=18\` \`tailwindcss>=4\` \`motion>=11\` \`@base-ui/react>=1.0.0\`

## Add the CSS with Tailwind CSS v4

Import the tokens and preset at the top of your global stylesheet, then include the library source in Tailwind scanning:

\`\`\`css
/* Design tokens: colors, radii, shadows, and light/dark theme values */
@import "@hulianui/tokens/tokens.css";
/* Tailwind CSS v4 preset: semantic tokens, utilities, and the data-theme dark variant */
@import "@hulianui/tokens/preset.css";
/* Hulian UI ships TypeScript source; make Tailwind scan it. Adjust this path for your stylesheet. */
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
\`\`\`

## Add providers

Wrap the application with \`ThemeProvider\`, then mount each imperative overlay provider once:

\`\`\`tsx
import {
  ThemeProvider,
  ToastProvider,
  ModalProvider,
  NotificationProvider,
} from "@hulianui/ui";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultSetting="system">
      {children}
      {/* Required mount points for toast(), modal.*(), and notification.*() */}
      <ToastProvider />
      <ModalProvider />
      <NotificationProvider />
    </ThemeProvider>
  );
}
\`\`\`

## Non-negotiable rules

1. **Use components from \`@hulianui/ui\`**. Search the library before writing an equivalent component yourself.
2. **Import from the root package**: \`import { Button, DatePicker, Table } from "@hulianui/ui"\`. There are no subpath entry points, including for the date family.
3. **Use theme tokens instead of fixed colors**. For SVG attributes and inline styles, use values such as \`var(--color-primary)\` and \`var(--color-foreground)\`. Color variables must include the \`--color-\` prefix so Tailwind CSS v4 can resolve them.
4. **Do not reach into a component's internal markup with local styles**. Use the component's public props to change appearance or behavior.
5. **Read the documentation before coding instead of guessing props**. With MCP installed, call \`get_component_doc\`. Otherwise fetch ${EN_BASE}/d/<component-slug>.md.

## Recommended: install the MCP server

\`@hulianui/mcp\` lets an AI assistant query components, usage, and rules on demand instead of loading the whole library or guessing prop signatures.

\`\`\`bash
npx @hulianui/mcp init-agent
\`\`\`

It writes the usage contract into the files each client reads (\`CLAUDE.md\`, \`AGENTS.md\`, \`.cursor/rules/hulianui.mdc\`, and others) **without touching your existing content**.

Claude Code and Cursor configuration:

\`\`\`json
{
  "mcpServers": {
    "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] }
  }
}
\`\`\`

Once connected, the server tells the assistant when and in what order to call each tool. See the [@hulianui/mcp documentation](https://www.npmjs.com/package/@hulianui/mcp) for the full tool list and the audit workflow for existing projects.

Without MCP, point the assistant at the machine-readable docs: ${EN_BASE}/d/<component-slug>.md for one component and ${EN_BASE}/llms.txt for the component index. Every component page also has a **Copy MD** button.

## Install blocks and pages

Blocks are usually self-contained. Pages can compose several blocks. Registry metadata installs recursive block dependencies and rewrites repository paths for the consuming project:

\`\`\`bash
npx shadcn@latest add ${EN_BASE}/r/block-pricing-table.json
npx shadcn@latest add ${EN_BASE}/r/page-dashboard.json
\`\`\`

After installation, replace sample data, copy, callbacks, and providers listed in the item's \`replace\` and \`providers\` fields. Composable regions appear in \`slots\`. Then run:

\`\`\`bash
npx -y @hulianui/guard src
\`\`\`

Components normally do not need source installation; import them directly unless you intend to modify the component implementation. See \`registry.json\` for the complete installable catalog.

## Prompt template

\`\`\`text
I am using the @hulianui/ui React design system.
Read this integration guide first and follow its non-negotiable rules:
${EN_BASE}/start
For complete interfaces such as login pages, pricing tables, and dashboards,
inspect registry blocks and pages before starting from scratch.
\`\`\`
`;
