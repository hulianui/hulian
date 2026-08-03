"use client";
import { copy } from "./page.content";

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
} from "@hulianui/ui";
import { CreditCard as CardIcon, Wallet, Trash2, ShieldCheck } from "lucide-react";
import { useBilling } from "../../_lib/billing-store";

const walletMeta = {
  wechat: { label: copy("wechatPay"), provider: "wechat" as const },
  alipay: { label: copy("alipay"), provider: "alipay" as const },
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
        <Field label={copy("cardNumber")}>
          <Input
            inputMode="numeric"
            placeholder="4111 1111 1111 1111"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            prefix={<CardIcon className="size-4 text-muted" />}
          />
        </Field>
        <Field label={copy("cardholder")}>
          <Input placeholder="SHEN YANZHI" value={holder} onChange={(e) => setHolder(e.target.value.toUpperCase())} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={copy("validityPeriod")} description="MM/YY">
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
          <Field label={copy("securityCode")} description={copy("threeDigitsOnTheBackOfThe")}>
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
        >{copy("addBankCard")}</Button>
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
          {clean ? copy("identifiedAs", detectBrand(clean).toUpperCase()) : copy("previewTheCardSurfaceWhileTyping")}
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
    toast({ title: boundWallets.includes(k) ? copy("unboundValue", walletMeta[k].label) : copy("boundValue", walletMeta[k].label), tone: "info" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{copy("paymentMethod")}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <ShieldCheck className="size-4 text-primary" />{copy("theCardNumberIsStoredEncryptedBy")}</p>
      </div>

      {/* 已绑定卡片 + 默认选择（Choicebox 单选）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{copy("defaultPaymentMethod")}</h2>
        <ChoiceboxGroup
          value={defaultMethodId}
          onValueChange={(v) => setDefaultMethod(v as string)}
          columns={1}
          aria-label={copy("defaultPaymentMethod2")}
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
                    {m.id === defaultMethodId && <Tag tone="brand" size="sm">{copy("default")}</Tag>}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {m.wallet === "wechat" ? copy("wechatPay2") : copy("alipay2")}
                    {m.id === defaultMethodId && <Tag tone="brand" size="sm">{copy("default2")}</Tag>}
                  </span>
                )
              }
              description={m.type === "card" ? copy("valueValidityPeriodValue", m.holder, m.expiry) : m.walletAccount}
            >
              {methods.length > 1 && (
                <button
                  type="button"
                  aria-label={copy("removeThisPaymentMethod")}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeMethod(m.id);
                    toast({ title: copy("paymentMethodRemoved"), tone: "neutral" });
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
        <h2 className="mb-1 text-sm font-semibold text-foreground">{copy("quickPayment")}</h2>
        <p className="mb-4 text-xs text-muted">{copy("afterBindingYouCanUseTheCorresponding")}</p>
        <div className="flex flex-wrap gap-3">
          {(["wechat", "alipay"] as const).map((k) => {
            const bound = boundWallets.includes(k);
            return (
              <div key={k} className="flex items-center gap-2">
                <SocialButton provider={k} variant={bound ? "solid" : "outline"} onClick={() => toggleWallet(k)}>
                  {bound ? copy("boundValue2", walletMeta[k].label) : copy("bindingValue", walletMeta[k].label)}
                </SocialButton>
                {bound && <Tag tone="success" size="sm" dot>{copy("alreadyActivated")}</Tag>}
              </div>
            );
          })}
        </div>
      </section>

      {/* 新增银行卡（CreditCard 实时预览）*/}
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{copy("addBankCard2")}</h2>
          <ButtonGroup attached={false} gap="sm" aria-label={copy("testCardNumber")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast({ title: copy("testCardNumberVisa"), tone: "neutral" })}
            >{copy("useTestCard")}</Button>
          </ButtonGroup>
        </div>
        <Divider className="mb-5" />
        <AddCardForm
          onAdd={(m) => {
            addCard(m);
            toast({ title: copy("valueAddedValue", detectBrand(m.number).toUpperCase(), m.number.slice(-4)), tone: "success" });
          }}
        />
      </section>
    </div>
  );
}
