"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ProfileCardProps } from "./profile-card.types";

// 吸取自 React Bits ProfileCard：指针位置驱动 3D 倾斜 + 全息炫彩光泽的「卡牌」效果，
// 内部用 RAF 阻尼弹簧把指针坐标平滑成 CSS 变量（--rotate-x/y、--pointer-x/y），进场有归中动画。
// 瑚琏化：去掉所有外链贴图（无头像时落「姓名首字母」占位）；全息色/光晕吃 var(--color-chart-*) token，随明暗主题；
// 自带 RAF 弹簧引擎替原 gsap 式手写 RAF（零依赖）；useReducedMotion 直接降级为静态卡（DOM 不变）；
// 底部信息条用 bg-surface/border-border token + 毛玻璃；关键帧 hulian-profile-card 落 preset.css。

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, p = 3) => Number.parseFloat(v.toFixed(p));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) =>
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

const INITIAL_DURATION = 1100;
const ENTER_TRANSITION_MS = 180;

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  // CJK：取首字符；拉丁：取前两词首字母
  if (/[一-龥]/.test(trimmed)) return trimmed.slice(0, 1);
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileCard({
  avatarUrl,
  name = "瑚琏",
  title = "前端工程师",
  handle = "hulianui",
  status = "在线",
  contactText = "联系",
  showUserInfo = true,
  onContactClick,
  enableTilt = true,
  glowColor = "var(--color-chart-1)",
  aspectRatio = 0.74,
  className,
  style,
  children,
  ...props
}: ProfileCardProps &
  Omit<HTMLAttributes<HTMLDivElement>, "style" | "children" | "color" | "className">) {
  const prefersReduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const active = enableTilt && !prefersReduced;

  // RAF 阻尼弹簧引擎：把指针坐标平滑成卡片 CSS 变量。纯 requestAnimationFrame，无第三方动画库。
  const engine = useMemo(() => {
    if (!active) return null;

    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;
    let curX = 0;
    let curY = 0;
    let tgtX = 0;
    let tgtY = 0;
    let initialUntil = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;

    const apply = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;
      const w = shell.clientWidth || 1;
      const h = shell.clientHeight || 1;
      const px = clamp((100 / w) * x);
      const py = clamp((100 / h) * y);
      const cx = px - 50;
      const cy = py - 50;
      const vars: Record<string, string> = {
        "--pointer-x": `${px}%`,
        "--pointer-y": `${py}%`,
        "--bg-x": `${adjust(px, 0, 100, 35, 65)}%`,
        "--bg-y": `${adjust(py, 0, 100, 35, 65)}%`,
        "--from-center": `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
        "--rotate-x": `${round(-(cx / 5))}deg`,
        "--rotate-y": `${round(cy / 4)}deg`,
      };
      for (const [k, v] of Object.entries(vars)) wrap.style.setProperty(k, v);
    };

    const step = (ts: number) => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);
      curX += (tgtX - curX) * k;
      curY += (tgtY - curY) * k;
      apply(curX, curY);
      const far = Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05;
      if (far) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        rafId = null;
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number) {
        curX = x;
        curY = y;
        apply(x, y);
      },
      setTarget(x: number, y: number) {
        tgtX = x;
        tgtY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(ms: number) {
        initialUntil = performance.now() + ms;
        start();
      },
      current() {
        return { x: curX, y: curY, tx: tgtX, ty: tgtY };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      },
    };
  }, [active]);

  const offsets = (e: ReactPointerEvent<HTMLDivElement>, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const shell = shellRef.current;
      if (!shell || !engine) return;
      const { x, y } = offsets(e, shell);
      engine.setTarget(x, y);
    },
    [engine],
  );

  const onPointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const shell = shellRef.current;
      if (!shell || !engine) return;
      shell.dataset.active = "true";
      shell.dataset.entering = "true";
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(() => {
        if (shellRef.current) delete shellRef.current.dataset.entering;
      }, ENTER_TRANSITION_MS);
      const { x, y } = offsets(e, shell);
      engine.setTarget(x, y);
    },
    [engine],
  );

  const onPointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !engine) return;
    engine.toCenter();
    const settle = () => {
      const { x, y, tx, ty } = engine.current();
      if (Math.hypot(tx - x, ty - y) < 0.6) {
        if (shellRef.current) delete shellRef.current.dataset.active;
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(settle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(settle);
  }, [engine]);

  // 进场归中动画
  useEffect(() => {
    if (!engine) return;
    const shell = shellRef.current;
    if (!shell) return;
    const initialX = (shell.clientWidth || 0) - 70;
    const initialY = 60;
    engine.setImmediate(initialX, initialY);
    engine.toCenter();
    engine.beginInitial(INITIAL_DURATION);
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      engine.cancel();
    };
  }, [engine]);

  const rootStyle = useMemo(
    () =>
      ({
        "--glow": glowColor,
        "--card-aspect": `${aspectRatio}`,
        ...style,
      }) as CSSProperties,
    [glowColor, aspectRatio, style],
  );

  return (
    <div
      {...props}
      ref={wrapRef}
      style={rootStyle}
      className={cn(
        "group relative isolate inline-block [perspective:520px] [touch-action:none]",
        className,
      )}
    >
      {/* 背后光晕：随指针位置径向发光，hover/active 时浮现 */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-[1.75rem] opacity-0 blur-2xl transition-opacity duration-200",
          active &&
            "group-hover:opacity-80 group-has-data-[active=true]:opacity-80",
        )}
        style={{
          background:
            "radial-gradient(circle at var(--pointer-x,50%) var(--pointer-y,50%), var(--glow) 0%, transparent 55%)",
        }}
      />
      <div
        ref={shellRef}
        className="group/shell relative z-0 [container-type:inline-size]"
        onPointerEnter={active ? onPointerEnter : undefined}
        onPointerMove={active ? onPointerMove : undefined}
        onPointerLeave={active ? onPointerLeave : undefined}
      >
        <section
          className={cn(
            "relative grid aspect-[var(--card-aspect)] h-[68svh] max-h-[480px] overflow-hidden rounded-[1.75rem]",
            "bg-surface text-foreground [backface-visibility:hidden] [transform:translateZ(0)_rotateX(0deg)_rotateY(0deg)]",
            "shadow-xl ring-1 ring-border/60",
            active &&
              "transition-transform duration-700 ease-out group-data-[active=true]/shell:duration-0 group-data-[entering=true]/shell:duration-200 group-data-[active=true]/shell:[transform:translateZ(0)_rotateX(var(--rotate-y))_rotateY(var(--rotate-x))]",
          )}
        >
          {/* 内层底色渐变 */}
          <div
            aria-hidden
            className="absolute inset-0 rounded-[1.75rem]"
            style={{
              background:
                "linear-gradient(145deg, color-mix(in oklch, var(--glow) 24%, transparent) 0%, color-mix(in oklch, var(--color-chart-4) 18%, transparent) 100%)",
            }}
          />
          {/* 全息光泽层：炫彩条纹 + 减少动态时静止 */}
          <div
            aria-hidden
            data-shine
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-50 mix-blend-color-dodge",
              "[background-size:300%_300%] [background-position:var(--bg-x,50%)_var(--bg-y,50%)]",
              "[animation:hulian-profile-card_18s_linear_infinite] motion-reduce:[animation:none]",
            )}
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, var(--color-chart-1) 5%, var(--color-chart-2) 10%, var(--color-chart-3) 15%, var(--color-chart-4) 20%, var(--color-chart-5) 25%, var(--color-chart-1) 30%)",
            }}
          />
          {/* 高光眩光层：随指针的椭圆高光 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.75rem] mix-blend-overlay"
            style={{
              background:
                "radial-gradient(farthest-corner circle at var(--pointer-x,50%) var(--pointer-y,50%), color-mix(in oklch, var(--color-foreground) 50%, transparent) 10%, transparent 60%)",
            }}
          />

          {/* 头像区 */}
          <div className="relative grid place-items-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${name} 头像`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover mix-blend-luminosity"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 grid place-items-center"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, color-mix(in oklch, var(--glow) 30%, transparent), transparent 70%)",
                }}
              >
                <span className="select-none text-[clamp(3rem,18cqw,6rem)] font-semibold text-foreground/70">
                  {initials(name)}
                </span>
              </div>
            )}
          </div>

          {children}

          {/* 主标题 */}
          <div className="pointer-events-none relative z-[2] flex flex-col items-center justify-start gap-1 pt-8 text-center">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{name}</h3>
            <p className="text-sm text-muted">{title}</p>
          </div>

          {/* 底部毛玻璃信息条 */}
          {showUserInfo && (
            <div className="pointer-events-none absolute inset-x-5 bottom-5 z-[3] flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-surface/40 p-3 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/15 text-sm font-medium text-primary">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = "0";
                      }}
                    />
                  ) : (
                    initials(name)
                  )}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-sm font-medium text-foreground">@{handle}</span>
                  <span className="text-xs text-muted">{status}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onContactClick}
                aria-label={`联系 ${name}`}
                className="pointer-events-auto rounded-xl border border-border/60 bg-surface/60 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {contactText}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
