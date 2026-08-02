"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Copy, RefreshCw } from "../_icons";
import { Checkbox } from "../checkbox/checkbox";
import { useLocaleValue } from "../config/locale-context";
import { Input } from "../input/input";
import { cn } from "../lib/cn";
import { NumberField } from "../number-field/number-field";
import { Segmented } from "../segmented/segmented";
import { Slider } from "../slider/slider";
import { Switch } from "../switch/switch";
import {
  CHARSET,
  LENGTH_RANGE,
  MIN_COUNT_RANGE,
  WORDS_RANGE,
  generateSecret,
} from "./password-generator.core";
import type {
  GeneratedSecret,
  GeneratorMode,
  PassphraseOptions,
  PasswordGeneratorLabels,
  PasswordGeneratorProps,
  PasswordOptions,
  StrengthLevel,
} from "./password-generator.types";

// 密码生成器面板（Bitwarden 式）：字符密码 / 密码短语双模，参数即时重算，熵值实时评级。
//
// 三个不显眼但要紧的实现决定：
//
// 1. **首帧不生成**。生成结果每次都不同，SSR 出一串、客户端 hydrate 出另一串必然 mismatch。
//    所以初值为 null，挂载后的 effect 里才生成；空窗期用等宽占位符撑住高度，避免布局跳动。
// 2. **改参数即重算**。改了长度却还看着旧密码，用户会以为参数没生效。effect 依赖参数对象，
//    动任何一项都会重新出值——这也是 Bitwarden 的行为。
// 3. **不吞随机源异常**。环境没有 crypto.getRandomValues 时展示明确错误而不是悄悄换 Math.random，
//    也不让异常冒泡炸掉整棵树。

const iconBtn =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const rowCls = "flex items-center justify-between gap-3 text-sm";

/** 强度档 → 点亮格数 + 配色。四格是刻意的：比连续进度条更容易一眼判断「够不够」。 */
const STRENGTH_VIEW: Record<StrengthLevel, { filled: number; bar: string; text: string }> = {
  weak: { filled: 1, bar: "bg-danger", text: "text-danger" },
  fair: { filled: 2, bar: "bg-warning", text: "text-warning" },
  good: { filled: 3, bar: "bg-success", text: "text-success" },
  strong: { filled: 4, bar: "bg-success", text: "text-success" },
};

/**
 * 结果区逐字符着色：数字与符号高亮，字母保持常规。
 * 这不是装饰——手抄 12 位随机串时，能一眼分出 `l` 和 `1`、`0` 和 `O` 才抄得对。
 */
function charClass(ch: string): string {
  if (ch >= "0" && ch <= "9") return "text-primary";
  if (CHARSET.special.includes(ch)) return "text-danger";
  return "text-foreground";
}

export function PasswordGenerator({
  mode: modeProp,
  defaultMode = "password",
  onModeChange,
  modes = ["password", "passphrase"],
  defaultPasswordOptions,
  defaultPassphraseOptions,
  onOptionsChange,
  onGenerate,
  onCopy,
  copyable = true,
  showStrength = true,
  showOptions = true,
  actions,
  labels,
  className,
}: PasswordGeneratorProps) {
  const locale = useLocaleValue("passwordGenerator", {
    password: "密码",
    passphrase: "密码短语",
    regenerate: "重新生成",
    copy: "复制",
    copied: "已复制",
    strength: "强度",
    weak: "弱",
    fair: "一般",
    good: "强",
    strong: "很强",
    length: "长度",
    uppercase: "大写 A-Z",
    lowercase: "小写 a-z",
    digits: "数字 0-9",
    special: "符号 !@#$%^&*",
    minDigits: "最少数字",
    minSpecial: "最少符号",
    avoidAmbiguous: "排除形近字符",
    words: "词数",
    separator: "分隔符",
    capitalize: "首字母大写",
    includeNumber: "包含数字",
    entropyUnit: "bit",
    result: "生成结果",
    unavailable: "当前环境不支持安全随机数，无法生成",
  });
  const t: PasswordGeneratorLabels = useMemo(() => ({ ...locale, ...labels }), [locale, labels]);

  const uid = useId();
  const [modeState, setModeState] = useState<GeneratorMode>(modes[0] ?? defaultMode);
  const mode = modeProp ?? modeState;

  const [pwOptions, setPwOptions] = useState<PasswordOptions>(() => ({
    length: 14,
    uppercase: true,
    lowercase: true,
    digits: true,
    special: true,
    minDigits: 1,
    minSpecial: 1,
    avoidAmbiguous: false,
    ...defaultPasswordOptions,
  }));
  const [ppOptions, setPpOptions] = useState<PassphraseOptions>(() => ({
    words: 6,
    separator: "-",
    capitalize: false,
    includeNumber: false,
    ...defaultPassphraseOptions,
  }));

  const [secret, setSecret] = useState<GeneratedSecret | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  // 回调放 ref：它们通常是内联箭头函数，直接进 effect 依赖会每次渲染都重新生成一遍密码。
  const onGenerateRef = useRef(onGenerate);
  const onOptionsChangeRef = useRef(onOptionsChange);
  useEffect(() => {
    onGenerateRef.current = onGenerate;
    onOptionsChangeRef.current = onOptionsChange;
  });

  const generate = useCallback(() => {
    try {
      const next =
        mode === "password"
          ? generateSecret("password", pwOptions)
          : generateSecret("passphrase", ppOptions);
      setSecret(next);
      setFailed(false);
      onGenerateRef.current?.(next);
    } catch {
      setSecret(null);
      setFailed(true);
    }
  }, [mode, pwOptions, ppOptions]);

  // 挂载后首次生成 + 任一参数变化后重算（依赖是 generate，其依赖即 mode/两份参数对象）
  useEffect(() => generate(), [generate]);

  const notifyOptions = useCallback(
    (next: {
      mode?: GeneratorMode;
      password?: PasswordOptions;
      passphrase?: PassphraseOptions;
    }) => {
      onOptionsChangeRef.current?.({
        mode: next.mode ?? mode,
        password: next.password ?? pwOptions,
        passphrase: next.passphrase ?? ppOptions,
      });
    },
    [mode, pwOptions, ppOptions],
  );

  const patchPw = useCallback(
    (patch: Partial<PasswordOptions>) => {
      setPwOptions((prev) => {
        const next = { ...prev, ...patch };
        notifyOptions({ password: next });
        return next;
      });
    },
    [notifyOptions],
  );

  const patchPp = useCallback(
    (patch: Partial<PassphraseOptions>) => {
      setPpOptions((prev) => {
        const next = { ...prev, ...patch };
        notifyOptions({ passphrase: next });
        return next;
      });
    },
    [notifyOptions],
  );

  const changeMode = (next: string) => {
    const m = next as GeneratorMode;
    if (modeProp === undefined) setModeState(m);
    onModeChange?.(m);
    notifyOptions({ mode: m });
  };

  const handleCopy = () => {
    if (!secret) return;
    void navigator.clipboard?.writeText(secret.value);
    onCopy?.(secret.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const view = STRENGTH_VIEW[secret?.strength ?? "weak"];
  const levelLabel = t[secret?.strength ?? "weak"];
  const showModes = modes.length > 1;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-[var(--radius)] border border-border bg-surface p-4",
        className,
      )}
    >
      {showModes && (
        <Segmented
          items={modes.map((m) => ({ value: m, label: t[m] }))}
          value={mode}
          onValueChange={changeMode}
          aria-label={t.result}
        />
      )}

      {/* 结果区：等宽字体 + 按模式选断行策略 */}
      <div className="flex items-start gap-2 rounded-[min(var(--radius),0.5rem)] border border-hairline bg-bg p-3">
        <output
          aria-label={t.result}
          aria-live="polite"
          className={cn(
            "min-h-10 flex-1 font-mono text-sm leading-6 select-all",
            // 密码没有词边界，只能逐字符断（break-all），否则整串溢出容器；
            // 短语有分隔符，break-words 会优先断在连字符处——从词中间劈开会毁掉它「能读能背」的全部价值
            mode === "password" ? "break-all" : "break-words",
          )}
        >
          {failed ? (
            <span className="text-danger">{t.unavailable}</span>
          ) : secret ? (
            [...secret.value].map((ch, i) => (
              // key 用下标：这里是一串无身份的字符，重排即整体重排，没有可稳定标识的实体
              <span key={i} className={charClass(ch)}>
                {ch}
              </span>
            ))
          ) : (
            // 首帧占位：撑住高度，避免生成后整个面板向下跳
            <span className="text-muted">{"•".repeat(14)}</span>
          )}
        </output>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" onClick={generate} aria-label={t.regenerate} className={iconBtn}>
            <RefreshCw className="size-4" />
          </button>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              disabled={!secret}
              aria-label={copied ? t.copied : t.copy}
              className={iconBtn}
            >
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            </button>
          )}
        </div>
      </div>

      {showStrength && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">{t.strength}</span>
          <div
            role="meter"
            aria-label={t.strength}
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={secret ? view.filled : 0}
            aria-valuetext={levelLabel}
            className="flex h-1.5 flex-1 items-stretch gap-1"
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  secret && i < view.filled ? view.bar : "bg-surface-hover",
                )}
              />
            ))}
          </div>
          <span className="tabular-nums text-muted">
            {secret ? Math.round(secret.entropy) : 0} {t.entropyUnit}
          </span>
          <span className={cn("font-medium", secret ? view.text : "text-muted")}>{levelLabel}</span>
        </div>
      )}

      {showOptions && mode === "password" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className={rowCls}>
              <label htmlFor={`${uid}-length`} className="text-muted">
                {t.length}
              </label>
              <span className="tabular-nums text-foreground">{pwOptions.length}</span>
            </div>
            <Slider
              id={`${uid}-length`}
              aria-label={t.length}
              min={LENGTH_RANGE.min}
              max={LENGTH_RANGE.max}
              value={pwOptions.length ?? 14}
              onValueChange={(v) => patchPw({ length: Array.isArray(v) ? v[0] : v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Checkbox
              label={t.uppercase}
              checked={pwOptions.uppercase}
              onCheckedChange={(v) => patchPw({ uppercase: v })}
            />
            <Checkbox
              label={t.lowercase}
              checked={pwOptions.lowercase}
              onCheckedChange={(v) => patchPw({ lowercase: v })}
            />
            <Checkbox
              label={t.digits}
              checked={pwOptions.digits}
              onCheckedChange={(v) => patchPw({ digits: v })}
            />
            <Checkbox
              label={t.special}
              checked={pwOptions.special}
              onCheckedChange={(v) => patchPw({ special: v })}
            />
          </div>

          {(pwOptions.digits || pwOptions.special) && (
            <div className="grid grid-cols-2 gap-3">
              {pwOptions.digits && (
                <div className={rowCls}>
                  <span className="text-muted">{t.minDigits}</span>
                  <NumberField
                    aria-label={t.minDigits}
                    className="w-24"
                    min={MIN_COUNT_RANGE.min}
                    max={MIN_COUNT_RANGE.max}
                    value={pwOptions.minDigits ?? 1}
                    onValueChange={(v) => patchPw({ minDigits: v ?? MIN_COUNT_RANGE.min })}
                  />
                </div>
              )}
              {pwOptions.special && (
                <div className={rowCls}>
                  <span className="text-muted">{t.minSpecial}</span>
                  <NumberField
                    aria-label={t.minSpecial}
                    className="w-24"
                    min={MIN_COUNT_RANGE.min}
                    max={MIN_COUNT_RANGE.max}
                    value={pwOptions.minSpecial ?? 1}
                    onValueChange={(v) => patchPw({ minSpecial: v ?? MIN_COUNT_RANGE.min })}
                  />
                </div>
              )}
            </div>
          )}

          <div className={rowCls}>
            <label htmlFor={`${uid}-ambiguous`} className="text-muted">
              {t.avoidAmbiguous}
            </label>
            <Switch
              id={`${uid}-ambiguous`}
              size="sm"
              checked={pwOptions.avoidAmbiguous}
              onCheckedChange={(v) => patchPw({ avoidAmbiguous: v })}
            />
          </div>
        </div>
      )}

      {showOptions && mode === "passphrase" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className={rowCls}>
              <label htmlFor={`${uid}-words`} className="text-muted">
                {t.words}
              </label>
              <span className="tabular-nums text-foreground">{ppOptions.words}</span>
            </div>
            <Slider
              id={`${uid}-words`}
              aria-label={t.words}
              min={WORDS_RANGE.min}
              max={WORDS_RANGE.max}
              value={ppOptions.words ?? 6}
              onValueChange={(v) => patchPp({ words: Array.isArray(v) ? v[0] : v })}
            />
          </div>

          <div className={rowCls}>
            <label htmlFor={`${uid}-separator`} className="text-muted">
              {t.separator}
            </label>
            <Input
              id={`${uid}-separator`}
              className="w-24 text-center font-mono"
              maxLength={3}
              value={ppOptions.separator ?? "-"}
              onChange={(e) => patchPp({ separator: e.target.value })}
            />
          </div>

          <div className={rowCls}>
            <label htmlFor={`${uid}-capitalize`} className="text-muted">
              {t.capitalize}
            </label>
            <Switch
              id={`${uid}-capitalize`}
              size="sm"
              checked={ppOptions.capitalize}
              onCheckedChange={(v) => patchPp({ capitalize: v })}
            />
          </div>

          <div className={rowCls}>
            <label htmlFor={`${uid}-number`} className="text-muted">
              {t.includeNumber}
            </label>
            <Switch
              id={`${uid}-number`}
              size="sm"
              checked={ppOptions.includeNumber}
              onCheckedChange={(v) => patchPp({ includeNumber: v })}
            />
          </div>
        </div>
      )}

      {actions && <div className="flex items-center justify-end gap-2">{actions}</div>}
    </div>
  );
}
