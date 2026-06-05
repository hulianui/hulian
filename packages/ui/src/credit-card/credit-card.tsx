"use client";
import { cn } from "../lib/cn";
import type { CardBrand, CreditCardProps } from "./credit-card.types";

// 银行卡可视化展示（结算页确认 / 钱包卡片 / 账单页）。卡号品牌识别与格式化抽成纯函数可测，
// 卡面用 token 渐变 + 品牌字标，正反两面。纯展示，不做输入（输入用 Input + 这些纯函数辅助）。

const onlyDigits = (s: string) => s.replace(/\D/g, "");

/** 纯函数：按卡号前缀识别品牌。 */
export function detectBrand(number: string): CardBrand {
  const n = onlyDigits(number);
  if (/^4/.test(n)) return "visa";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^62/.test(n)) return "unionpay";
  if (/^35/.test(n)) return "jcb";
  if (/^(6011|65|64[4-9])/.test(n)) return "discover";
  return "unknown";
}

/** 纯函数：按品牌分组卡号（amex 4-6-5，其余 4-4-4-4）。 */
export function formatCardNumber(number: string, brand?: CardBrand): string {
  const n = onlyDigits(number);
  const b = brand ?? detectBrand(n);
  const groups = b === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= n.length) break;
    out.push(n.slice(i, i + g));
    i += g;
  }
  if (i < n.length) out.push(n.slice(i));
  return out.join(" ");
}

/** 纯函数：保留后 4 位，其余转 •（保持分组结构）。 */
export function maskCardNumber(number: string, brand?: CardBrand): string {
  const n = onlyDigits(number);
  if (n.length <= 4) return formatCardNumber(n, brand);
  const masked = "•".repeat(n.length - 4) + n.slice(-4);
  // 复用格式化分组：把数字位替换回 • 占位
  const grouped = formatCardNumber(n, brand);
  let k = 0;
  return grouped.replace(/\d/g, () => {
    const ch = masked[k];
    k += 1;
    return ch;
  });
}

const BRAND_META: Record<CardBrand, { label: string; gradient: string }> = {
  visa: { label: "VISA", gradient: "from-[#1a1f71] to-[#2563eb]" },
  mastercard: { label: "Mastercard", gradient: "from-[#1f2937] to-[#b45309]" },
  amex: { label: "AMEX", gradient: "from-[#0f766e] to-[#0ea5e9]" },
  unionpay: { label: "银联", gradient: "from-[#7f1d1d] to-[#1e3a8a]" },
  discover: { label: "Discover", gradient: "from-[#7c2d12] to-[#ea580c]" },
  jcb: { label: "JCB", gradient: "from-[#3730a3] to-[#9333ea]" },
  unknown: { label: "", gradient: "from-slate-700 to-slate-900" },
};

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "mastercard")
    return (
      <span className="flex items-center" aria-label="Mastercard">
        <span className="size-6 rounded-full bg-[#eb001b]" />
        <span className="-ml-3 size-6 rounded-full bg-[#f79e1b] mix-blend-screen" />
      </span>
    );
  return <span className="text-lg font-bold italic tracking-wide">{BRAND_META[brand].label}</span>;
}

export function CreditCard({
  number,
  holder,
  expiry,
  brand: brandProp,
  masked = true,
  flipped = false,
  cvc,
  className,
}: CreditCardProps) {
  const brand = brandProp ?? detectBrand(number);
  const meta = BRAND_META[brand];
  const display = masked ? maskCardNumber(number, brand) : formatCardNumber(number, brand);

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-80 max-w-full overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-xl",
        meta.gradient,
        className,
      )}
      role="img"
      aria-label={`${meta.label || "银行卡"} 尾号 ${onlyDigits(number).slice(-4)}`}
    >
      {/* 装饰光斑 */}
      <span className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10" aria-hidden />
      <span className="pointer-events-none absolute -bottom-16 -left-6 size-44 rounded-full bg-white/5" aria-hidden />

      {flipped ? (
        // 背面：磁条 + CVC
        <div className="flex h-full flex-col">
          <div className="mt-5 h-10 w-full bg-black/70" aria-hidden />
          <div className="flex flex-1 flex-col justify-center px-5">
            <div className="flex items-center gap-3">
              <div className="h-8 flex-1 rounded bg-white/85" aria-hidden />
              <div className="rounded bg-white px-3 py-1 font-mono text-sm tracking-widest text-slate-900">
                {cvc ?? "•••"}
              </div>
            </div>
            <div className="mt-2 text-right text-[10px] uppercase tracking-wide text-white/70">CVC</div>
          </div>
          <div className="flex justify-end px-5 pb-4">
            <BrandMark brand={brand} />
          </div>
        </div>
      ) : (
        // 正面
        <div className="flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            {/* 芯片 */}
            <span className="grid h-8 w-11 grid-cols-3 gap-px overflow-hidden rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 p-1" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="rounded-[1px] bg-yellow-500/40" />
              ))}
            </span>
            <BrandMark brand={brand} />
          </div>

          <div className="font-mono text-xl tracking-[0.15em] tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">
            {display || "•••• •••• •••• ••••"}
          </div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wide text-white/60">持卡人</div>
              <div className="truncate font-medium tracking-wide">{holder || "YOUR NAME"}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[10px] uppercase tracking-wide text-white/60">有效期</div>
              <div className="font-mono tracking-wide tabular-nums">{expiry || "MM/YY"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
