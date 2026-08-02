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
    ],
    controls: [
        {
            prop: "size",
            type: "select",
            options: ["sm", "base"],
            defaultValue: "base",
            label: "Dimensions",
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
    ],
    renderWithProps: (p) => (<Prose size={p.size as ProseSize} className="max-w-2xl">
      <h2>Hulian Prose</h2>
      <p>
        Unified take over rich text typesetting, eat semantics token,<a href="#">Link</a> with <code>code</code> Consistently presented.
      </p>
      <blockquote>Containers have unified rules, and the content only cares about semantics.</blockquote>
    </Prose>),
    toCode: (p) => `<Prose${p.size === "sm" ? " size=\"sm\"" : ""}>{/* Rich text HTML/JSX */}</Prose>`,
};
