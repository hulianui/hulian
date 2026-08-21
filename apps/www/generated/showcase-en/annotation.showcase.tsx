import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Annotation } from "../../../../packages/ui/src/annotation/annotation";
import type { AnnotationSide, AnnotationTone } from "../../../../packages/ui/src/annotation/annotation.types";
const SIDES: AnnotationSide[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
export const annotationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Encloses a piece of inline content, note is the handwritten marginalia. side says **where the label is** (same as Tooltip/Popover), and the arrow automatically points back to the target from the label. The label is absolutely positioned and does not occupy the layout position, so leave space around the container.",
            code: `<p>
  Task ID is written as <Annotation note="Stable ID" side="ne">CLI-042</Annotation>,
  You won't lose contact even if you change the title.
</p>`,
            render: () => (<div className="px-10 py-14 text-[0.95rem]">
          Task ID is written{" "}
          <Annotation note="Stable ID" side="ne">
            CLI-042
          </Annotation>
          , you won't lose contact even if you change the title.
        </div>),
        },
        {
            title: "Dissecting a line of code",
            description: "The most typical use of annotation: break down a line of things and talk about them piece by piece. When hanging multiple labels in the same line, use side to stagger the directions, and use offset to fine-tune them if necessary. The last three strips are close to each other. Use --hl-ann-spread to narrow the outward expansion of the highlighter, so that the background color will not be connected into a whole piece and cannot be separated from the boundary.",
            code: `<code>
  - [ ] <Annotation note="Stable ID" side="n" tone="primary">CLI-042</Annotation>{" "}
  Add export command{" "}
  <Annotation note="tag" side="n" tone="success" className="[--hl-ann-spread:0.1em]">#cli</Annotation>{" "}
  <Annotation note="Priority" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">!high</Annotation>{" "}
  <Annotation note="Custom field" side="se" tone="warning" className="[--hl-ann-spread:0.1em]">
    @blocked_by:CLI-041
  </Annotation>
</code>`,
            render: () => (<div className="px-10 py-20">
          <code className="font-mono text-[0.9rem] whitespace-nowrap">
            - [ ]{" "}
            <Annotation note="Stable ID" side="n" tone="primary">
              CLI-042
            </Annotation>{" "}
            Add export command{" "}
            <Annotation note="Tags" side="n" tone="success" className="[--hl-ann-spread:0.1em]">
              #cli
            </Annotation>{" "}
            <Annotation note="Priority" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">
              !high
            </Annotation>{" "}
            <Annotation note="Custom fields" side="se" tone="warning" className="[--hl-ann-spread:0.1em]">
              @blocked_by:CLI-041
            </Annotation>
          </code>
        </div>),
        },
        {
            title: "Eight directions",
            description: "side is the location of the label. The four positive orientation anchors are centered on corresponding sides, and the four diagonal orientation anchors are aligned toward the outside at the target corners, so the label only grows away from the target as it lengthens.",
            code: `{["n", "ne", "e", "se", "s", "sw", "w", "nw"].map((side) => (
  <Annotation key={side} note={side} side={side}>Target</Annotation>
))}`,
            render: () => (<div className="grid grid-cols-4 gap-x-32 gap-y-24 px-20 py-20 text-[0.9rem]">
          {SIDES.map((side) => (<span key={side} className="text-center">
              <Annotation note={side} side={side} labelWidth={60}>
                Target
              </Annotation>
            </span>))}
        </div>),
        },
        {
            title: "Tone color",
            description: "tone only dyes and annotates itself (the background color of the highlighter is derived from it), and the annotated text remains in its original color. rainbow is a cycle of hues, purely for decoration; it will stop at the starting color when the animation preference is reduced.",
            code: `<Annotation note="Neutral" tone="neutral">Default</Annotation>
<Annotation note="Main Color" tone="primary">Accent</Annotation>
<Annotation note="Correct answer" tone="success">Passed</Annotation>
<Annotation note="Attention" tone="warning">Warning</Annotation>
<Annotation note="pit" tone="danger">Danger</Annotation>
<Annotation note="Rainbow" tone="rainbow">Decoration</Annotation>`,
            render: () => (<div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-20 px-10 py-16 text-[0.95rem]">
          <Annotation note="Neutral" tone="neutral">
            Default
          </Annotation>
          <Annotation note="Main color" tone="primary">
            Highlight
          </Annotation>
          <Annotation note="Correct answer" tone="success">
            Passed
          </Annotation>
          <Annotation note="NOTE" tone="warning">
            Warning
          </Annotation>
          <Annotation note="Pit" tone="danger">
            Danger
          </Annotation>
          <Annotation note="Rainbow" tone="rainbow">
            Decoration
          </Annotation>
        </div>),
        },
        {
            title: "Just circle without note",
            description: "If note is not passed, only the highlighter background color will be left, and no arrows or labels will be drawn - used to simply circle a piece of content. On the other hand, mark={false} retains the annotation and removes the background color.",
            code: `<p>
  What really matters is <Annotation tone="warning">this sentence</Annotation>,
  The rest is <Annotation note="Can be skipped" side="s" mark={false}>Background explanation</Annotation>.
</p>`,
            render: () => (<div className="px-10 py-16 text-[0.95rem]">
          What really matters is <Annotation tone="warning">This sentence</Annotation>, the rest are{" "}
          <Annotation note="Can be skipped" side="s" mark={false}>
            Background explanation
          </Annotation>
          .
        </div>),
        },
        {
            title: "Label ReactNode",
            description: "note is a real DOM node rather than a content pseudo-element of CSS, so it can be placed in any ReactNode - embedded code, links, emphasis, and can be read by screen readers.",
            code: `<Annotation
  note={<>See <code>docs/specs</code></>}
  side="e"
  tone="primary"
>
  spec file
</Annotation>`,
            render: () => (<div className="px-10 py-14 text-[0.95rem]">
          <Annotation note={<>
                See <code className="font-mono">docs/specs</code>
              </>} side="e" tone="primary" labelWidth={130}>
            spec file
          </Annotation>
        </div>),
        },
        {
            title: "Handwritten fonts and alignment",
            description: "The Chinese fonts (Handwritten/Pianpian/Xingkai) in the handwriting font stack are system fonts, which are only available if they are installed; if they are not installed, they will fall back to the main text fonts, and the tilt angle and color matching are still there. To be more restrained in formal documents, you can use handwritten={false} with rotate={0}.",
            code: `<Annotation note="Handwriting \u00B7 Default slant" side="n">Default</Annotation>
<Annotation note="Text \u00B7 Straighten" side="n" handwritten={false} rotate={0}>Restraint</Annotation>`,
            render: () => (<div className="flex items-center justify-center gap-x-24 px-10 py-16 text-[0.95rem]">
          <Annotation note="Handwriting · Default italic" side="n" labelWidth={120}>
            Default
          </Annotation>
          <Annotation note="Text font · Orientation" side="n" handwritten={false} rotate={0} labelWidth={120}>
            Restraint
          </Annotation>
        </div>),
        },
    ],
    controls: [
        { prop: "note", type: "text", defaultValue: "Stable ID", label: "Tags" },
        {
            prop: "side",
            type: "select",
            options: SIDES,
            defaultValue: "ne",
            label: "Orientation",
        },
        {
            prop: "tone",
            type: "select",
            options: ["neutral", "primary", "success", "warning", "danger", "rainbow"],
            defaultValue: "neutral",
            label: "Tone",
        },
        { prop: "mark", type: "boolean", defaultValue: true, label: "Highlighter base color" },
        { prop: "handwritten", type: "boolean", defaultValue: true, label: "Handwritten font" },
    ],
    states: [
        {
            name: "Default (upper right)",
            render: () => (<div className="px-8 py-12">
          <Annotation note="Stable ID">CLI-042</Annotation>
        </div>),
        },
        {
            name: "Directly below",
            render: () => (<div className="px-8 py-12">
          <Annotation note="Priority" side="s" tone="danger">
            !high
          </Annotation>
        </div>),
        },
        {
            name: "Right",
            render: () => (<div className="px-8 py-10">
          <Annotation note="Custom fields" side="e" tone="warning">
            @blocked_by
          </Annotation>
        </div>),
        },
        {
            name: "Just circle without note",
            render: () => (<div className="px-8 py-8">
          <Annotation tone="primary">This section</Annotation>
        </div>),
        },
        {
            name: "Rainbow",
            render: () => (<div className="px-8 py-12">
          <Annotation note="For decoration" tone="rainbow">
            rainbow
          </Annotation>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="px-10 py-16 text-[0.95rem]">
      <Annotation note={String(p.note)} side={p.side as AnnotationSide} tone={p.tone as AnnotationTone} mark={Boolean(p.mark)} handwritten={Boolean(p.handwritten)}>
        CLI-042
      </Annotation>
    </div>),
    toCode: (p) => `<Annotation note="${p.note}" side="${p.side}" tone="${p.tone}"${p.mark ? "" : " mark={false}"}${p.handwritten ? "" : " handwritten={false}"}>CLI-042</Annotation>`,
};
