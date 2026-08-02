"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GiftFeed } from "../../../../packages/ui/src/gift-feed/gift-feed";
import type { GiftEvent } from "../../../../packages/ui/src/gift-feed/gift-feed.types";
const GIFTS = [
    { name: "Be careful", icon: "\uD83D\uDC96", color: "var(--color-chart-1)" },
    { name: "Rocket", icon: "\uD83D\uDE80", color: "var(--color-chart-2)" },
    { name: "Castle", icon: "\uD83C\uDFF0", color: "var(--color-chart-4)" },
    { name: "Sports car", icon: "\uD83C\uDFCE\uFE0F", color: "var(--color-chart-3)" },
];
const USERS = ["Rich man", "momo", "Night sailing", "Abai"];
function GiftFeedDemo({ max = 3, duration = 4000 }: {
    max?: number;
    duration?: number;
}) {
    const [events, setEvents] = useState<GiftEvent[]>([]);
    const combo = useRef<Record<string, number>>({});
    const n = useRef(0);
    useEffect(() => {
        const id = setInterval(() => {
            const i = n.current++;
            const groupId = `g${Math.floor(i / 4)}`;
            combo.current[groupId] = (combo.current[groupId] ?? 0) + 1;
            const g = GIFTS[Math.floor(i / 4) % GIFTS.length];
            setEvents((p) => [
                ...p.slice(-30),
                { id: groupId, user: { name: USERS[Math.floor(i / 4) % USERS.length] }, gift: g, combo: combo.current[groupId] },
            ]);
        }, 700);
        return () => clearInterval(id);
    }, []);
    return (<div className="grid h-72 w-80 place-items-end rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900 p-4">
      <GiftFeed events={events} max={max} duration={duration} className="w-full"/>
    </div>);
}
export const giftFeedShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Controlled incoming gift event stream (events array append), the component automatically merges with the id combo and plays the entry animation.",
            code: `const [events, setEvents] = useState<GiftEvent[]>([]);
//Add an event when receiving a gift; the same id is passed in again \u2192 combo is incremented
// setEvents((p) => [...p, { id: "g1", user: { name: "Local Rich Brother" }, gift: { name: "Rocket", icon: "\uD83D\uDE80" }, combo }]);

<GiftFeed events={events} />`,
            render: () => <GiftFeedDemo />,
        },
        {
            title: "Banner limit",
            description: "max controls the number of banners on the screen at the same time (the oldest will be squeezed out if exceeded), only 1 is retained here.",
            code: `<GiftFeed events={events} max={1} />`,
            render: () => <GiftFeedDemo max={1}/>,
        },
        {
            title: "Length of stay",
            description: "duration Controls the dwell milliseconds after a single banner has no new combos. After shortening, the banner will dissipate faster.",
            code: `<GiftFeed events={events} duration={2000} />`,
            render: () => <GiftFeedDemo duration={2000}/>,
        },
    ],
    controls: [],
    states: [{ name: "Gift combo (same as gift combo \u00D7N rolling \u00B7 automatically dissipated \u00B7 upper limit of 3 items)", render: () => <GiftFeedDemo /> }],
    renderWithProps: () => <GiftFeedDemo />,
    toCode: () => `<GiftFeed events={events} max={3} duration={4000} />`,
};
