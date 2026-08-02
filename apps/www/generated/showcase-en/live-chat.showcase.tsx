"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LiveChat } from "../../../../packages/ui/src/live-chat/live-chat";
import type { LiveChatItem } from "../../../../packages/ui/src/live-chat/live-chat.types";
const NAMES = ["Abai", "momo", "Night sailing", "Fawn", "Kris", "Doudoulong", "tits", "Sea Breeze", "Nan", "Coke"];
const MSGS = ["Hello anchor~", "How to buy this", "Ask for link", "Already following", "Let's talk about it", "So beautiful", "Squat", "Front row", "Placed an order", "Good deal"];
function pick<T>(arr: T[], i: number): T {
    return arr[i % arr.length];
}
function LiveChatDemo() {
    const [items, setItems] = useState<LiveChatItem[]>([
        { id: "s0", type: "system", text: "Welcome to the live broadcast room, please speak in a civilized manner~" },
    ]);
    const n = useRef(0);
    useEffect(() => {
        const id = setInterval(() => {
            const i = n.current++;
            const name = pick(NAMES, i * 3 + 1);
            let item: LiveChatItem;
            const r = i % 7;
            if (r === 0)
                item = { id: `e${i}`, type: "enter", user: { name } };
            else if (r === 3)
                item = { id: `g${i}`, type: "gift", user: { name }, gift: { name: "Be careful", icon: "\uD83D\uDC96", combo: 1 + (i % 9) } };
            else if (r === 5)
                item = { id: `f${i}`, type: "follow", user: { name } };
            else
                item = { id: `m${i}`, type: "message", user: { name, level: 1 + (i % 30) }, text: pick(MSGS, i) };
            setItems((p) => [...p, item]);
        }, 900);
        return () => clearInterval(id);
    }, []);
    return (<div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
      <LiveChat items={items} pinned={[{ id: "p1", type: "system", text: "The draw will be held at 8pm tonight, pay attention and don't get lost" }]} className="h-full"/>
    </div>);
}
const SAMPLE: LiveChatItem[] = [
    { id: "s0", type: "system", text: "Welcome to the live broadcast room, please speak in a civilized manner~" },
    { id: "e1", type: "enter", user: { name: "Night sailing" } },
    { id: "m1", type: "message", user: { name: "Abai", level: 12 }, text: "Hello anchor~" },
    { id: "f1", type: "follow", user: { name: "momo" } },
    { id: "g1", type: "gift", user: { name: "Fawn" }, gift: { name: "Be careful", icon: "\uD83D\uDC96", combo: 6 } },
    { id: "m2", type: "message", user: { name: "Kris", level: 3 }, text: "Ask for link" },
    { id: "m3", type: "message", user: { name: "Doudoulong", level: 28 }, text: "Placed an order" },
];
export const liveChatShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items controlled append, the component automatically rolls to the bottom; supports message / enter / gift / follow / system multiple message types.",
            code: `<LiveChat
  items={[
    { id: "s0", type: "system", text: "Welcome to the live broadcast room~" },
    { id: "e1", type: "enter", user: { name: "Night Ship" } },
    { id: "m1", type: "message", user: { name: "Abai", level: 12 }, text: "Hello anchor~" },
    { id: "g1", type: "gift", user: { name: "Fawn" }, gift: { name: "Be careful", icon: "\uD83D\uDC96", combo: 6 } },
  ]}
/>`,
            render: () => (<div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
          <LiveChat items={SAMPLE} className="h-full"/>
        </div>),
        },
        {
            title: "Pinned Announcement",
            description: "pinned is rendered in the top sticky area (announcements/rules) and does not participate in the scroll flow.",
            code: `<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "The draw will be held at 8 o'clock tonight, pay attention to not get lost" }]}
/>`,
            render: () => (<div className="h-80 w-72 rounded-[var(--radius)] border border-border bg-surface p-3">
          <LiveChat items={SAMPLE} pinned={[{ id: "p1", type: "system", text: "The draw will be held at 8pm tonight, pay attention and don't get lost" }]} className="h-full"/>
        </div>),
        },
        {
            title: "Video overlay status",
            description: "overlay C for public screen superimposed on dark video: hide scroll bar, top fade, text turned white with shadow.",
            code: `<div className="relative aspect-[9/16] bg-black">
  <video ... />
  <div className="absolute inset-x-2 bottom-2 h-48">
    <LiveChat items={items} overlay className="h-full" />
  </div>
</div>`,
            render: () => (<div className="h-80 w-44 overflow-hidden rounded-[var(--radius)] bg-gradient-to-b from-slate-600 to-slate-900 p-3">
          <LiveChat items={SAMPLE} overlay className="h-full"/>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Live public screen (multiple types of messages \u00B7 Automatic scrolling \u00B7 Scroll up to display \"N new messages\" recovery button)", render: () => <LiveChatDemo /> }],
    renderWithProps: () => <LiveChatDemo />,
    toCode: () => `<LiveChat
  items={items}
  pinned={[{ id: "p1", type: "system", text: "Announcement..." }]}
/>`,
};
