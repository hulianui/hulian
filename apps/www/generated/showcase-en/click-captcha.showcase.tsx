"use client";
import { useCallback, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ClickCaptcha } from "../../../../packages/ui/src/click-captcha/click-captcha";
import type { CaptchaPoint, ClickCaptchaStatus } from "../../../../packages/ui/src/click-captcha/click-captcha.types";
const CHARS = ["Book", "Mountain", "Water", "Cloud", "Wind", "Month"];
function demoImage(seed: number): string {
    const pick = [0, 1, 2].map((i) => CHARS[(seed + i * 2) % CHARS.length]);
    const spots = [
        { x: 46, y: 62 },
        { x: 132, y: 40 },
        { x: 236, y: 96 },
    ];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="155" viewBox="0 0 310 155">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#5b7db1"/><stop offset="55%" stop-color="#8aa6c8"/><stop offset="100%" stop-color="#c9b79a"/>
    </linearGradient></defs>
    <rect width="310" height="155" fill="url(#g)"/>
    <circle cx="60" cy="30" r="42" fill="#ffffff" opacity="0.12"/>
    <circle cx="250" cy="120" r="56" fill="#000000" opacity="0.10"/>
    ${pick
        .map((c, i) => `<text x="${spots[i].x}" y="${spots[i].y}" font-size="30" font-family="serif" fill="#fff" opacity="0.92" transform="rotate(${(seed * 7 + i * 23) % 30 - 15} ${spots[i].x} ${spots[i].y})">${c}</text>`)
        .join("")}
  </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function hintImage(seed: number): string {
    const pick = [0, 1, 2].map((i) => CHARS[(seed + i * 2) % CHARS.length]);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="24" viewBox="0 0 96 24">
    <rect width="96" height="24" rx="4" fill="#1f2937"/>
    <text x="48" y="17" font-size="14" font-family="serif" fill="#fff" text-anchor="middle">${pick.join(" ")}</text>
  </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
function Demo() {
    const [seed, setSeed] = useState(1);
    const [status, setStatus] = useState<ClickCaptchaStatus>("idle");
    const [last, setLast] = useState<CaptchaPoint[] | null>(null);
    const onComplete = useCallback(async (pts: CaptchaPoint[]) => {
        setLast(pts);
        setStatus("verifying");
        await new Promise((r) => setTimeout(r, 700));
        const ok = pts.every((p) => p.x > 0.03 && p.x < 0.97 && p.y > 0.03 && p.y < 0.97);
        setStatus(ok ? "success" : "failed");
    }, []);
    return (<div className="flex w-full flex-col items-center gap-3">
      <ClickCaptcha backgroundSrc={demoImage(seed)} hintSrc={hintImage(seed)} status={status} onComplete={onComplete} onRefresh={() => {
            setSeed((s) => s + 1);
            setStatus("idle");
            setLast(null);
        }}/>
      <p className="text-xs text-muted">
        {last ? `Return point:${last.map((p) => `(${p.x.toFixed(2)}, ${p.y.toFixed(2)})`).join(" ")}` : "Click on the three prompts in the picture"}
      </p>
    </div>);
}
function ControlledDemo() {
    const [points, setPoints] = useState<CaptchaPoint[]>([]);
    return (<div className="flex w-full flex-col items-center gap-3">
      <ClickCaptcha backgroundSrc={demoImage(3)} points={points} onPointsChange={setPoints} maxPoints={4}/>
      <ul className="w-full max-w-sm space-y-1 text-xs text-muted">
        {points.length === 0 && <li>Externally held point array, which can be cleared/played back by itself</li>}
        {points.map((p, i) => (<li key={`${p.x}-${p.y}-${i}`}>
            #{i + 1} → x {p.x.toFixed(3)} · y {p.y.toFixed(3)}
          </li>))}
      </ul>
    </div>);
}
export const clickCaptchaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Given the background image and prompt image, maxPoints is triggered to trigger onComplete; the encoding and request are taken over by the consumer.",
            code: `<ClickCaptcha
  backgroundSrc={bgUrl}
  hintSrc={hintUrl}
  status={status}
  onComplete={async (points) => {
    setStatus("verifying");
    const ok = await api.verify(encodePoints(points)); // The agreement is up to you
    setStatus(ok ? "success" : "failed");
  }}
  onRefresh={() => reloadCaptcha()}
/>`,
            render: () => <Demo />,
        },
        {
            title: "Controlled point",
            description: "points + onPointsChange are held externally; the relative coordinates are 0~1, converted according to the benchmark required by the own backend.",
            code: `const [points, setPoints] = useState<CaptchaPoint[]>([]);

<ClickCaptcha
  backgroundSrc={bgUrl}
  points={points}
  onPointsChange={setPoints}
  maxPoints={4}
/>`,
            render: () => <ControlledDemo />,
        },
        {
            title: "Verifying/Failed/Passed",
            description: "status driver three states: verifying locks interaction, failed jitters and clears points, success locks.",
            code: `<ClickCaptcha backgroundSrc={bgUrl} status="verifying" />
<ClickCaptcha backgroundSrc={bgUrl} status="failed" />
<ClickCaptcha backgroundSrc={bgUrl} status="success" />`,
            render: () => (<div className="flex w-full flex-col gap-4">
          <ClickCaptcha backgroundSrc={demoImage(2)} status="verifying" defaultPoints={[{ x: 0.2, y: 0.5 }]}/>
          <ClickCaptcha backgroundSrc={demoImage(4)} status="failed"/>
          <ClickCaptcha backgroundSrc={demoImage(5)} status="success" defaultPoints={[
                    { x: 0.16, y: 0.4 },
                    { x: 0.43, y: 0.26 },
                    { x: 0.77, y: 0.62 },
                ]}/>
        </div>),
        },
        {
            title: "Loading",
            description: "During loading, cover the mask and disable clicking (used when the backend releases new images).",
            code: `<ClickCaptcha backgroundSrc={bgUrl} loading />`,
            render: () => <ClickCaptcha backgroundSrc={demoImage(6)} loading/>,
        },
    ],
    controls: [],
    states: [{ name: "Click on the verification code \u00B7 Pick points \u2192 Verification \u2192 Success/Failure", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<ClickCaptcha
  backgroundSrc={bgUrl}
  hintSrc={hintUrl}
  status={status}
  onComplete={(points) => verify(points)}
  onRefresh={() => reloadCaptcha()}
/>`,
};
