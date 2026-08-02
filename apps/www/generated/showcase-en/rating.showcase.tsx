"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Heart, Star, Flame } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Rating } from "../../../../packages/ui/src/rating/rating";
const ICON_MAP: Record<string, ReactNode | undefined> = {
    star: undefined,
    heart: <Heart size="1em" fill="currentColor"/>,
    flame: <Flame size="1em" fill="currentColor"/>,
    outline: <Star size="1em"/>,
};
function Demo() {
    const [v, setV] = useState<number | null>(3);
    return <Rating value={v ?? 0} onValueChange={setV}/>;
}
export const ratingShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Uncontrolled default 3 stars, click/hover to change points; when controlled use value + onValueChange.",
            code: `<Rating defaultValue={3} onValueChange={setValue} />`,
            render: () => <Rating defaultValue={3}/>,
        },
        {
            title: "Read only",
            description: "readOnly Only displays ratings, no interaction.",
            code: `<Rating value={4} readOnly />`,
            render: () => <Rating value={4} readOnly/>,
        },
        {
            title: "Dimensions",
            description: "size controls the icon size (sm / md / lg).",
            code: `<>
  <Rating defaultValue={3} size="sm" />
  <Rating defaultValue={3} size="md" />
  <Rating defaultValue={3} size="lg" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <Rating defaultValue={3} size="sm"/>
          <Rating defaultValue={3} size="md"/>
          <Rating defaultValue={3} size="lg"/>
        </div>),
        },
        {
            title: "Custom color",
            description: "color accepts token var() or any CSS color, hover is automatically derived.",
            code: `<Rating defaultValue={4} color="var(--color-warning)" />`,
            render: () => <Rating defaultValue={4} color="var(--color-warning)"/>,
        },
        {
            title: "Custom icon",
            description: "icon Transparently transmits any icon (such as \u2764\uFE0F), and reuses the same shape in the empty state.",
            code: `<Rating
  defaultValue={3}
  color="var(--color-danger)"
  icon={<Heart size="1em" fill="currentColor" />}
/>`,
            render: () => (<Rating defaultValue={3} color="var(--color-danger)" icon={<Heart size="1em" fill="currentColor"/>}/>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "Dimensions" },
        {
            prop: "color",
            type: "select",
            options: ["var(--color-primary)", "var(--color-danger)", "var(--color-warning)", "#f59e0b"],
            defaultValue: "var(--color-primary)",
            label: "Star color",
        },
        {
            prop: "icon",
            type: "select",
            options: ["star", "heart", "flame", "outline"],
            defaultValue: "star",
            label: "icon",
        },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "Interactive", render: () => <Demo /> },
        { name: "Read only", render: () => <Rating value={4} readOnly/> },
        { name: "lg", render: () => <Rating defaultValue={3} size="lg"/> },
        { name: "Change color", render: () => <Rating defaultValue={4} color="var(--color-warning)"/> },
        {
            name: "Change to icon",
            render: () => (<Rating defaultValue={3} color="var(--color-danger)" icon={<Heart size="1em" fill="currentColor"/>}/>),
        },
    ],
    renderWithProps: (p) => (<Rating defaultValue={3} size={(p.size as "sm" | "md" | "lg") ?? "md"} color={(p.color as string) ?? "var(--color-primary)"} icon={ICON_MAP[(p.icon as string) ?? "star"]} readOnly={p.readOnly === true}/>),
    toCode: (p) => {
        const icon = (p.icon as string) ?? "star";
        const iconAttr = icon === "star" ? "" : ` icon={<${icon === "outline" ? "Star" : icon[0].toUpperCase() + icon.slice(1)} size="1em"${icon === "outline" ? "" : " fill=\"currentColor\""} />}`;
        return `<Rating defaultValue={3} size="${p.size ?? "md"}" color="${p.color ?? "var(--color-primary)"}"${iconAttr}${p.readOnly ? " readOnly" : ""} />`;
    },
};
