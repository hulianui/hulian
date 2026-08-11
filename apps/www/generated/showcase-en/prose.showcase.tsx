"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Prose } from "../../../../packages/ui/src/prose/prose";
import type { ProseSize } from "../../../../packages/ui/src/prose/prose.types";
const Article = () => (<Prose className="max-w-2xl">
    <h1>Hulian typesetting container Prose</h1>
    <p>
      Prose takes over the rendered rich text (markdown→HTML, MDX output or handwritten JSX) into a consistent reading layout.
      Title, paragraph, list,<a href="#">Link</a>,<code>Inline code</code> All references to semantics token,
      Automatic adaptation of light and dark themes.
    </p>
    <h2>Unordered list</h2>
    <ul>
      <li>Zero dependency, can be rendered in RSC (use client is not added to the ontology)</li>
      <li>
        Used for emphasis <strong>Bold</strong> with <em>Italic</em>
      </li>
      <li>All colors and rounded corners go to token, don't write it to death</li>
    </ul>
    <h2>Code Block</h2>
    <pre>
      <code>{`import { Prose } from "@hulianui/ui";

<Prose>{htmlContent}</Prose>;`}</code>
    </pre>
    <blockquote>Typography is a silent design - the container unifies the rules, and the content only cares about semantics.</blockquote>
    <hr />
    <p>Bottom paragraph, verify that the margins of the first and last sub-elements converge.</p>
  </Prose>);
const Collapsibles = () => (<Prose className="max-w-2xl">
    <h2>Collapsible details / summary</h2>
    <p>GFM collapsible blocks in markdown output inherit Prose typography, sharing the same visual family as code blocks.</p>
    <details open>
      <summary>Show answer</summary>
      <p>
        A list comprehension computes every result into memory at once; a generator expression yields items one at a time while iterating,
        so the latter never pulls an entire large file into memory.
      </p>
      <details>
        <summary>Show how to read the traceback (one nested level)</summary>
        <p>Nested collapsible blocks take the subtle background, one step apart from the outer level, so the hierarchy reads in both light and dark themes.</p>
      </details>
    </details>
    <details>
      <summary>Show full code (collapsed by default)</summary>
      <pre>
        <code>{`with open("data.txt") as f:
    total = sum(int(line) for line in f)`}</code>
      </pre>
    </details>
  </Prose>);
const WideTable = ({ scrollableTables }: {
    scrollableTables?: boolean;
}) => (<Prose scrollableTables={scrollableTables} className="max-w-sm">
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Upstream channel</th>
          <th>Model</th>
          <th>Requests</th>
          <th>Failure rate</th>
          <th>Avg latency</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2026-08-11</td>
          <td>East China primary</td>
          <td>claude-opus-5</td>
          <td>12,345</td>
          <td>0.12%</td>
          <td>820ms</td>
        </tr>
        <tr>
          <td>2026-08-10</td>
          <td>North China fallback</td>
          <td>claude-sonnet-5</td>
          <td>8,901</td>
          <td>0.31%</td>
          <td>640ms</td>
        </tr>
      </tbody>
    </table>
  </Prose>);
export const proseShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic typesetting",
            description: "Insert the rendered rich text (HTML/JSX/MDX output) into Prose, and the title/paragraph/list/link/inline code uniformly eats the semantics of token.",
            code: `<Prose>
  <h1>Hulian typesetting container Prose</h1>
  <p>
    Titles, paragraphs, lists, <a href="#">links</a>, <code>inline code</code> and quotes
    All semantics token, light and dark themes are automatically adapted.
  </p>
  <ul>
    <li>Zero dependency, can be rendered in RSC</li>
    <li> emphasize with <strong>bold</strong> and <em>italic</em></li>
  </ul>
  <blockquote> Typography is a silent design. </blockquote>
</Prose>`,
            render: () => <Article />,
        },
        {
            title: "Compact size",
            description: "size=\"sm\" Reduce the standard font size to text-sm, which is suitable for sidebar descriptions and long text in cards.",
            code: `<Prose size="sm">
  <h2>Compact layout</h2>
  <p> is suitable for dense scenes such as sidebar descriptions and long text in cards. The rest of the layout rules remain consistent. </p>
  <ul>
    <li>Sidebar Document</li>
    <li>Rich text in the card</li>
  </ul>
</Prose>`,
            render: () => (<Prose size="sm" className="max-w-2xl">
          <h2>Compact layout</h2>
          <p>Suitable for dense scenarios such as sidebar descriptions and long text in cards. The rest of the formatting rules remain the same.</p>
          <ul>
            <li>Sidebar Documentation</li>
            <li>Rich text in the card</li>
          </ul>
        </Prose>),
        },
        {
            title: "Collapsible blocks (incl. nested)",
            description: "GFM details / summary shares the same visual family as code blocks; nested blocks take the subtle background to separate from the outer level.",
            code: `<Prose>
  <details open>
    <summary>Show answer</summary>
    <p>A generator expression yields items one at a time while iterating, never loading the whole dataset into memory.</p>
    <details>
      <summary>Show how to read the traceback (one nested level)</summary>
      <p>Nested collapsible blocks take the subtle background, one step apart from the outer level.</p>
    </details>
  </details>
</Prose>`,
            render: () => <Collapsibles />,
        },
        {
            title: "Wide-table horizontal scrolling",
            description: "scrollableTables lets many-column tables scroll horizontally inside themselves instead of breaking the measure; headers stop wrapping as a result (otherwise columns collapse to one character wide and never scroll). The trade-off is that table width follows content.",
            code: `<Prose scrollableTables>
  <table>{/* Six-column wide table: scrolls horizontally inside a narrow container */}</table>
</Prose>`,
            render: () => <WideTable scrollableTables/>,
        },
    ],
    controls: [
        {
            prop: "size",
            type: "select",
            options: ["sm", "base"],
            defaultValue: "base",
            label: "Size",
        },
        {
            prop: "scrollableTables",
            type: "boolean",
            defaultValue: false,
            label: "Wide-table horizontal scrolling",
        },
    ],
    states: [
        {
            name: "Complete article (title/paragraph/list/code/quote/separator)",
            render: () => <Article />,
        },
        {
            name: "Compact size (size=sm)",
            render: () => (<Prose size="sm" className="max-w-2xl">
          <h2>Compact layout</h2>
          <p>
            size=&quot;sm&quot; Reduce the base font size to text-sm, which is suitable for dense scenarios such as sidebar descriptions and long text in cards.
            The rest of the formatting rules remain the same.
          </p>
          <ul>
            <li>Sidebar Documentation</li>
            <li>Rich text in the card</li>
          </ul>
        </Prose>),
        },
        {
            name: "Collapsible blocks (details/summary, incl. one nested level)",
            render: () => <Collapsibles />,
        },
        {
            name: "Wide table: default (breaks out of the container)",
            render: () => <WideTable />,
        },
        {
            name: "Wide table: scrollableTables (scrolls inside the table)",
            render: () => <WideTable scrollableTables/>,
        },
    ],
    renderWithProps: (p) => (<Prose size={p.size as ProseSize} scrollableTables={p.scrollableTables as boolean} className="max-w-2xl">
      <h2>Hulian Prose</h2>
      <p>
        Unified take over rich text typesetting, eat semantics token,<a href="#">Link</a> with <code>code</code> Consistently presented.
      </p>
      <details>
        <summary>Show answer</summary>
        <p>Collapsible blocks share the same visual family as code blocks; summary text is not selectable.</p>
      </details>
      <blockquote>Containers have unified rules, and the content only cares about semantics.</blockquote>
    </Prose>),
    toCode: (p) => `<Prose${p.size === "sm" ? " size=\"sm\"" : ""}${p.scrollableTables ? " scrollableTables" : ""}>{/* Rich text HTML/JSX */}</Prose>`,
};
