"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Headset, Heart, Send, ShoppingBag } from "lucide-react";
import {
  Avatar,
  Button,
  ChatMessage,
  Conversation,
  Danmaku,
  Drawer,
  DrawerContent,
  FloatingReactions,
  GiftFeed,
  LiveChat,
  LivePlayer,
  LiveProductCard,
  PromptInput,
  StreamingText,
  toast,
  type FloatingReactionsHandle,
} from "@hulianui/ui";
import { GIFT_PANEL, PRODUCTS, STREAMER } from "../../_data/content";
import { replyFor } from "../../_lib/live-sim";
import { useLiveSim } from "../../_lib/use-live-sim";

interface CsMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export function RoomView() {
  const { state, send } = useLiveSim();
  const hearts = useRef<FloatingReactionsHandle>(null);
  const seq = useRef(0);
  const combo = useRef<{ name: string; count: number; id: string } | null>(null);

  const [draft, setDraft] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [csOpen, setCsOpen] = useState(false);
  const [cs, setCs] = useState<CsMessage[]>([
    { id: "cs0", role: "assistant", text: "你好呀~我是瀚选 AI 客服，商品、优惠、物流都可以问我哦。" },
  ]);

  const explaining = PRODUCTS[0];

  const like = () => {
    hearts.current?.emit(undefined, { count: 3 });
    send({ type: "LIKE", n: 3 });
  };

  const submitDanmaku = () => {
    const t = draft.trim();
    if (!t) return;
    send({ type: "SEND_DANMAKU", id: `u${seq.current++}`, text: t });
    setDraft("");
  };

  const sendGift = (g: (typeof GIFT_PANEL)[number]) => {
    const same = combo.current?.name === g.name;
    const id = same ? combo.current!.id : `ug${seq.current++}`;
    const count = same ? combo.current!.count + 1 : 1;
    combo.current = { name: g.name, count, id };
    send({ type: "SEND_GIFT", id, gift: { name: g.name, icon: g.icon, color: g.color }, combo: count });
  };

  const askCs = (q: string) => {
    setCs((m) => [
      ...m,
      { id: `u${seq.current++}`, role: "user", text: q },
      { id: `a${seq.current++}`, role: "assistant", text: replyFor(q) },
    ]);
  };

  return (
    <div className="flex h-dvh items-center justify-center bg-neutral-950 sm:p-4">
      <div className="relative h-full w-full overflow-hidden bg-black sm:h-[844px] sm:max-h-[94vh] sm:w-[400px] sm:rounded-[28px] sm:ring-8 sm:ring-black/80">
        <LivePlayer
          src="/demo/sample-video.mp4"
          aspectRatio="fill"
          orientation="portrait"
          viewers={state.viewers}
          host={{ name: STREAMER.name, meta: STREAMER.meta, onFollow: () => toast({ title: "已关注主播", tone: "info" }) }}
          overlay={
            <>
              <Danmaku items={state.danmaku} tracks={4} speed={92} area={0.42} className="top-14" />
              <GiftFeed events={state.gifts} className="absolute bottom-44 left-3 w-56" />
              <FloatingReactions ref={hearts} className="right-4 left-auto translate-x-0" rise={300} />
              {/* 公屏：左下半屏 overlay 浅色态 */}
              <div className="pointer-events-auto absolute bottom-[88px] left-2 right-20 h-40">
                <LiveChat items={state.chat} overlay className="h-full" maxItems={40} />
              </div>
              {/* 讲解中小黄车角标 */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="pointer-events-auto absolute bottom-[136px] left-2 flex max-w-[160px] items-center gap-1.5 rounded-full bg-black/55 py-1 pl-1 pr-2.5 text-left text-white backdrop-blur-sm"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-chart-4 text-xs font-bold">
                  {explaining.index}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] leading-tight">{explaining.title}</span>
                  <span className="text-xs font-bold text-chart-1">¥{explaining.price}</span>
                </span>
              </button>
            </>
          }
          footer={
            <div className="pointer-events-auto flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-4 pt-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitDanmaku();
                }}
                className="flex flex-1 items-center gap-1 rounded-full bg-white/15 px-3 backdrop-blur-sm"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="说点什么…"
                  className="h-9 w-full bg-transparent text-sm text-white placeholder:text-white/55 focus:outline-none"
                />
                <button type="submit" aria-label="发送" className="text-white/80">
                  <Send className="size-4" />
                </button>
              </form>
              <RoundBtn label="小黄车" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="size-5" />
                <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-chart-4 text-[10px] font-bold">
                  {PRODUCTS.length}
                </span>
              </RoundBtn>
              <RoundBtn label="礼物" onClick={() => setGiftOpen(true)}>
                <Gift className="size-5" />
              </RoundBtn>
              <RoundBtn label="点赞" onClick={like}>
                <Heart className="size-5" />
              </RoundBtn>
            </div>
          }
        />

        {/* 返回 + AI 客服 悬浮 */}
        <Link
          href="/demos/live"
          className="absolute left-3 top-3 z-20 grid size-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm"
          aria-label="返回中控台"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <button
          type="button"
          onClick={() => setCsOpen(true)}
          className="absolute right-3 top-16 z-20 grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
          aria-label="AI 客服"
        >
          <Headset className="size-5" />
        </button>
      </div>

      {/* 小黄车抽屉 */}
      <Drawer open={cartOpen} onOpenChange={setCartOpen}>
        <DrawerContent side="bottom" title="小黄车" className="mx-auto max-w-[420px]">
          <div className="max-h-[60vh] space-y-2 overflow-y-auto p-1">
            {PRODUCTS.map((p) => (
              <LiveProductCard
                key={p.id}
                index={p.index}
                image={p.image}
                title={p.title}
                price={p.price}
                originalPrice={p.originalPrice}
                explaining={p.id === explaining.id}
                stock={p.stock}
                sold={p.sold}
                tag={p.tag}
                action={
                  <Button size="sm" tone="danger" onClick={() => toast({ title: `已下单：${p.index} 号`, tone: "info" })}>
                    去抢购
                  </Button>
                }
              />
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* 礼物面板 */}
      <Drawer open={giftOpen} onOpenChange={setGiftOpen}>
        <DrawerContent side="bottom" title="送礼物" className="mx-auto max-w-[420px]">
          <div className="grid grid-cols-4 gap-2 p-2">
            {GIFT_PANEL.map((g) => (
              <button
                key={g.name}
                type="button"
                onClick={() => sendGift(g)}
                className="flex flex-col items-center gap-1 rounded-[var(--radius)] border border-border py-3 transition hover:border-primary/50 hover:bg-surface-hover"
              >
                <span className="text-3xl">{g.icon}</span>
                <span className="text-xs text-foreground">{g.name}</span>
                <span className="text-[11px] text-muted">{g.coins} 币</span>
              </button>
            ))}
          </div>
          <p className="px-2 pb-1 text-center text-xs text-muted">连续点击同一礼物即可连击 combo～</p>
        </DrawerContent>
      </Drawer>

      {/* AI 客服 */}
      <Drawer open={csOpen} onOpenChange={setCsOpen}>
        <DrawerContent side="bottom" title="AI 客服" className="mx-auto flex h-[70vh] max-w-[420px] flex-col">
          <Conversation className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
            {cs.map((m) =>
              m.role === "user" ? (
                <ChatMessage key={m.id} role="user" avatar={<Avatar size="sm" fallback="我" />}>
                  {m.text}
                </ChatMessage>
              ) : (
                <ChatMessage key={m.id} role="assistant" name="瀚选客服" avatar={<Avatar size="sm" fallback="瀚" />}>
                  <StreamingText text={m.text} streaming className="text-sm leading-relaxed" />
                </ChatMessage>
              ),
            )}
          </Conversation>
          <div className="border-t border-border pt-2">
            <PromptInput placeholder="问问客服：尺码 / 优惠 / 发货…" onSubmit={(v) => v.trim() && askCs(v.trim())} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function RoundBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition active:scale-90"
    >
      {children}
    </button>
  );
}
