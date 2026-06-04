"use client";
import { Avatar, Divider, Rating, Statistic, Tag, toast } from "@hulian/ui";

// 列表行组件
function SettingRow({ icon, label, value, onClick }: { icon: string; label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => toast({ title: `${label} 功能即将上线`, tone: "neutral" }))}
      className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-surface-hover transition-colors"
    >
      <span className="text-xl w-6 text-center">{icon}</span>
      <span className="flex-1 text-left text-sm">{label}</span>
      {value && <span className="text-xs text-muted">{value}</span>}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14" className="text-muted shrink-0" aria-hidden>
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>
  );
}

export default function ProfilePage() {
  return (
    <div className="h-[580px] overflow-y-auto">
      {/* 用户信息头 */}
      <div className="bg-gradient-to-br from-primary/15 to-surface px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Avatar fallback="李" size="lg" />
          <div>
            <div className="text-base font-semibold">李小美</div>
            <div className="mt-0.5 text-xs text-muted">会员 · 已服务 12 次</div>
            <div className="mt-1">
              <Tag tone="warning" size="sm" variant="soft">黄金会员</Tag>
            </div>
          </div>
        </div>

        {/* 统计数字 */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-3 shadow-sm">
          <Statistic
            title="累计订单"
            value={12}
            className="text-center"
          />
          <Statistic
            title="优惠券"
            value={3}
            suffix="张"
            className="text-center"
          />
          <Statistic
            title="节省金额"
            value={186}
            prefix="¥"
            className="text-center"
          />
        </div>
      </div>

      {/* 我的评价 */}
      <div className="mx-4 mt-4 rounded-2xl border border-border bg-surface p-4">
        <div className="mb-2 text-sm font-semibold">我的评价</div>
        <div className="flex items-center gap-3">
          <Avatar fallback="张" size="sm" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">张阿姨 · 深度保洁</span>
              <Rating value={5} readOnly size="sm" />
            </div>
            <p className="mt-0.5 text-xs text-muted">服务很专业，家里干净多了，下次还会预约！</p>
          </div>
        </div>
      </div>

      <Divider className="my-3 mx-4" />

      {/* 功能菜单 */}
      <div className="mx-4 rounded-2xl border border-border bg-surface overflow-hidden">
        <SettingRow icon="🎫" label="优惠券" value="3 张可用" />
        <Divider />
        <SettingRow icon="📍" label="收货地址" />
        <Divider />
        <SettingRow icon="💳" label="支付方式" />
        <Divider />
        <SettingRow icon="⭐" label="我的收藏" />
        <Divider />
        <SettingRow icon="📋" label="服务记录" />
      </div>

      <div className="mx-4 mt-3 rounded-2xl border border-border bg-surface overflow-hidden">
        <SettingRow icon="🔔" label="消息通知" />
        <Divider />
        <SettingRow icon="🛡️" label="隐私设置" />
        <Divider />
        <SettingRow icon="❓" label="帮助与反馈" />
        <Divider />
        <SettingRow icon="ℹ️" label="关于我们" value="v2.6.1" />
      </div>

      <div className="pb-6 pt-3 text-center text-xs text-muted">到家服务 © 2026</div>
    </div>
  );
}
