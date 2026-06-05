"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { account, initialSubscription, paymentMethods as seedMethods } from "../_data/account";
import { addonById, planById, unitPrice } from "../_data/plans";
import type { BillingCycle, PaymentMethod } from "../_data/types";

// 瀚付共享内存态：订阅（套餐/周期/席位/增值项/默认支付方式）+ 已绑支付方式 + 工作状态 + Banner 关闭。
// 挂在 (app)/layout 的 BillingShell，跨页客户端导航保持，无 localStorage、无后端。

interface BillingStore {
  // 订阅
  planId: string;
  cycle: BillingCycle;
  seats: number;
  addons: string[];
  defaultMethodId: string;
  // 派生计费（按当前周期折算的「月度等效」与年付总额）
  monthlyTotal: number;
  annualTotal: number;
  setPlan: (id: string) => void;
  setCycle: (c: BillingCycle) => void;
  setSeats: (n: number) => void;
  toggleAddon: (id: string) => void;
  setDefaultMethod: (id: string) => void;
  // 支付方式
  methods: PaymentMethod[];
  addCard: (m: Omit<PaymentMethod, "id" | "type">) => void;
  removeMethod: (id: string) => void;
  // 状态表情
  status: string;
  setStatus: (e: string) => void;
  // Banner
  promoDismissed: boolean;
  dismissPromo: () => void;
}

const Ctx = createContext<BillingStore | null>(null);

export function BillingStoreProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState(initialSubscription.planId);
  const [cycle, setCycleState] = useState<BillingCycle>(initialSubscription.cycle);
  const [seats, setSeatsState] = useState(initialSubscription.seats);
  const [addons, setAddons] = useState<string[]>(initialSubscription.addons);
  const [defaultMethodId, setDefaultMethodId] = useState(initialSubscription.defaultMethodId);
  const [methods, setMethods] = useState<PaymentMethod[]>(seedMethods);
  const [status, setStatusState] = useState(account.status);
  const [promoDismissed, setPromoDismissed] = useState(false);

  const setPlan = useCallback((id: string) => setPlanId(id), []);
  const setCycle = useCallback((c: BillingCycle) => setCycleState(c), []);
  const setSeats = useCallback((n: number) => setSeatsState(Math.max(1, Math.min(99, n))), []);
  const toggleAddon = useCallback((id: string) => {
    setAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  }, []);
  const setDefaultMethod = useCallback((id: string) => setDefaultMethodId(id), []);
  const setStatus = useCallback((e: string) => setStatusState(e), []);
  const dismissPromo = useCallback(() => setPromoDismissed(true), []);

  const addCard = useCallback((m: Omit<PaymentMethod, "id" | "type">) => {
    setMethods((prev) => [...prev, { ...m, id: `pm-${prev.length + 1}-${(m.number ?? "").slice(-4)}`, type: "card" }]);
  }, []);

  const removeMethod = useCallback((id: string) => {
    setMethods((prev) => (prev.length <= 1 ? prev : prev.filter((m) => m.id !== id)));
    setDefaultMethodId((cur) => (cur === id ? seedMethods[0].id : cur));
  }, []);

  const value = useMemo<BillingStore>(() => {
    const plan = planById[planId];
    // 付费档按「席位 × 单价 + 增值项」算月度等效；免费/企业档归零。
    const seatUnit = plan && plan.monthly > 0 ? unitPrice(plan, cycle) : 0;
    const seatsCost = seatUnit * seats;
    const addonsCost = addons.reduce((s, id) => s + (addonById[id] ? unitPrice(addonById[id], cycle) : 0), 0);
    const monthlyTotal = seatsCost + addonsCost;
    return {
      planId,
      cycle,
      seats,
      addons,
      defaultMethodId,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
      setPlan,
      setCycle,
      setSeats,
      toggleAddon,
      setDefaultMethod,
      methods,
      addCard,
      removeMethod,
      status,
      setStatus,
      promoDismissed,
      dismissPromo,
    };
  }, [planId, cycle, seats, addons, defaultMethodId, methods, status, promoDismissed, setPlan, setCycle, setSeats, toggleAddon, setDefaultMethod, addCard, removeMethod, setStatus, dismissPromo]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBilling(): BillingStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBilling 必须在 BillingStoreProvider 内使用");
  return ctx;
}
