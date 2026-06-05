"use client";
import { useState } from "react";
import {
  CreditCard,
  ChoiceboxGroup,
  Choicebox,
  SocialButton,
  Button,
  ButtonGroup,
  Field,
  Input,
  Tag,
  Divider,
  detectBrand,
  toast,
} from "@hulian/ui";
import { CreditCard as CardIcon, Wallet, Trash2, ShieldCheck } from "lucide-react";
import { useBilling } from "../../_lib/billing-store";

const walletMeta = {
  wechat: { label: "微信支付", provider: "wechat" as const },
  alipay: { label: "支付宝", provider: "alipay" as const },
};

function AddCardForm({ onAdd }: { onAdd: (m: { number: string; holder: string; expiry: string }) => void }) {
  const [number, setNumber] = useState("");
  const [holder, setHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);

  const clean = number.replace(/\D/g, "");
  const valid = clean.length >= 15 && holder.trim().length > 0 && /^\d{2}\/\d{2}$/.test(expiry);

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_19rem] sm:items-start">
      <div className="flex flex-col gap-4">
        <Field label="卡号">
          <Input
            inputMode="numeric"
            placeholder="4111 1111 1111 1111"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            prefix={<CardIcon className="size-4 text-muted" />}
          />
        </Field>
        <Field label="持卡人">
          <Input placeholder="SHEN YANZHI" value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="有效期" description="MM/YY">
            <Input
              placeholder="08/27"
              value={expiry}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                setExpiry(v);
              }}
            />
          </Field>
          <Field label="安全码" description="卡背三位">
            <Input
              inputMode="numeric"
              placeholder="•••"
              maxLength={4}
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
            />
          </Field>
        </div>
        <Button
          disabled={!valid}
          onClick={() => {
            onAdd({ number: clean, holder: holder.trim(), expiry });
            setNumber("");
            setHolder("");
            setExpiry("");
            setCvc("");
          }}
        >
          添加银行卡
        </Button>
      </div>

      {/* 实时预览（输入时关闭打码，聚焦安全码翻面）*/}
      <div className="flex flex-col items-center gap-2">
        <CreditCard
          number={clean || ""}
          holder={holder || undefined}
          expiry={expiry || undefined}
          cvc={cvc || undefined}
          masked={false}
          flipped={flipped}
          className="w-full"
        />
        <p className="text-xs text-muted">
          {clean ? <>识别为 <span className="font-medium text-foreground">{detectBrand(clean).toUpperCase()}</span></> : "边输入边预览卡面"}
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  const { methods, defaultMethodId, setDefaultMethod, addCard, removeMethod } = useBilling();
  const [boundWallets, setBoundWallets] = useState<string[]>(["wechat"]);

  const toggleWallet = (k: "wechat" | "alipay") => {
    setBoundWallets((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
    toast({ title: boundWallets.includes(k) ? `已解绑${walletMeta[k].label}` : `已绑定${walletMeta[k].label}`, tone: "info" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">支付方式</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <ShieldCheck className="size-4 text-primary" /> 卡号经 PCI-DSS 加密存储，仅展示后四位
        </p>
      </div>

      {/* 已绑定卡片 + 默认选择（Choicebox 单选）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">默认扣款方式</h2>
        <ChoiceboxGroup
          value={defaultMethodId}
          onValueChange={(v) => setDefaultMethod(v as string)}
          columns={1}
          aria-label="默认扣款方式"
        >
          {methods.map((m) => (
            <Choicebox
              key={m.id}
              value={m.id}
              icon={m.type === "card" ? <CardIcon /> : <Wallet />}
              title={
                m.type === "card" ? (
                  <span className="flex items-center gap-2">
                    {m.brand?.toUpperCase()} •••• {m.number?.slice(-4)}
                    {m.id === defaultMethodId && <Tag tone="brand" size="sm">默认</Tag>}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {m.wallet === "wechat" ? "微信支付" : "支付宝"}
                    {m.id === defaultMethodId && <Tag tone="brand" size="sm">默认</Tag>}
                  </span>
                )
              }
              description={m.type === "card" ? `${m.holder} · 有效期 ${m.expiry}` : m.walletAccount}
            >
              {methods.length > 1 && (
                <button
                  type="button"
                  aria-label="移除此支付方式"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeMethod(m.id);
                    toast({ title: "已移除支付方式", tone: "neutral" });
                  }}
                  className="absolute right-11 top-3 grid size-8 place-items-center rounded-[var(--radius)] text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </Choicebox>
          ))}
        </ChoiceboxGroup>
      </section>

      {/* 绑定第三方钱包（SocialButton）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-1 text-sm font-semibold text-foreground">快捷支付</h2>
        <p className="mb-4 text-xs text-muted">绑定后可用对应钱包一键扣款。</p>
        <div className="flex flex-wrap gap-3">
          {(["wechat", "alipay"] as const).map((k) => {
            const bound = boundWallets.includes(k);
            return (
              <div key={k} className="flex items-center gap-2">
                <SocialButton provider={k} variant={bound ? "solid" : "outline"} onClick={() => toggleWallet(k)}>
                  {bound ? `已绑定${walletMeta[k].label}` : `绑定${walletMeta[k].label}`}
                </SocialButton>
                {bound && <Tag tone="success" size="sm" dot>已开通</Tag>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 新增银行卡（CreditCard 实时预览）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">添加银行卡</h2>
          <ButtonGroup attached={false} gap="sm" aria-label="测试卡号">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({ title: "测试卡号 4111 1111 1111 1111（Visa）", tone: "neutral" })}
            >
              用测试卡
            </Button>
          </ButtonGroup>
        </div>
        <Divider className="mb-5" />
        <AddCardForm
          onAdd={(m) => {
            addCard(m);
            toast({ title: `已添加 ${detectBrand(m.number).toUpperCase()} •••• ${m.number.slice(-4)}`, tone: "info" });
          }}
        />
      </section>
    </div>
  );
}
