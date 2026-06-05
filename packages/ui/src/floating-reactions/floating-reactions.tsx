"use client";
import { forwardRef, useImperativeHandle, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/cn";
import type { FloatingReactionsHandle, FloatingReactionsProps } from "./floating-reactions.types";

const DEFAULT_PALETTE = ["❤️", "💖", "💕", "🧡", "💛", "💚"];

interface Particle {
  key: number;
  content: ReactNode;
  startX: number; // 起点横向偏移（相对底部中点）px
  drift: number;
  duration: number;
  size: number;
}

export const FloatingReactions = forwardRef<FloatingReactionsHandle, FloatingReactionsProps>(
  function FloatingReactions({ palette = DEFAULT_PALETTE, rise = 220, drift = 40, duration = 2200, size = 24, className }, ref) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const seq = useRef(0);

    useImperativeHandle(ref, () => ({
      emit(content, opts) {
        const count = opts?.count ?? 1;
        const next: Particle[] = [];
        for (let i = 0; i < count; i++) {
          next.push({
            key: seq.current++,
            content: content ?? palette[Math.floor(Math.random() * palette.length)],
            startX: (Math.random() - 0.5) * 24,
            drift: (Math.random() - 0.5) * 2 * drift,
            duration: duration * (0.85 + Math.random() * 0.3),
            size: size * (0.8 + Math.random() * 0.5),
          });
        }
        setParticles((p) => [...p, ...next]);
      },
    }));

    const remove = (key: number) => setParticles((p) => p.filter((x) => x.key !== key));

    return (
      <div className={cn("pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2", className)} aria-hidden>
        {particles.map((p) => (
          <span
            key={p.key}
            onAnimationEnd={() => remove(p.key)}
            className="absolute bottom-0 select-none [text-shadow:0_2px_6px_rgba(0,0,0,0.25)]"
            style={
              {
                left: p.startX,
                fontSize: p.size,
                "--fr-rise": `${rise}px`,
                "--fr-drift": `${p.drift}px`,
                animation: `hulian-float-rise ${p.duration}ms ease-out forwards`,
              } as CSSProperties
            }
          >
            {p.content}
          </span>
        ))}
      </div>
    );
  },
);
