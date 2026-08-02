"use client";
import { copy } from "./page.content";
import { LoginForm, Text, Spotlight, toast } from "@hulianui/ui";
import { brand, SHOP_BASE } from "../_components/nav-config";

// 瀚选商城登录页。不在 (shop) 路由组内，无 ShopShell，自己做极简居中布局。
// 登录成功 toast + 跳 /demos/shop/account（window.location 触发完整导航）。

export default function ShopLoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-bg px-4">
      <Spotlight x="50%" y="30%" intensity={10} />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {/* 品牌 Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="grid size-12 place-items-center rounded-[var(--radius-lg)] bg-primary text-xl font-bold text-primary-foreground shadow-md">

            {copy("h")}
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight text-foreground">
              {brand.name} {brand.nameEn}
            </p>
            <p className="text-sm text-muted">{brand.slogan}</p>
          </div>
        </div>

        {/* 登录表单（LoginForm 自管 loading 态）*/}
        <div className="w-full">
          <LoginForm
            subtitle={copy("welcomeBackSignInToYourHanshopAccount")}
            onFinish={async () => {
              // 模拟网络请求
              await new Promise((r) => setTimeout(r, 600));
              toast({ title: copy("signedInWelcomeBack"), tone: "success" });
              await new Promise((r) => setTimeout(r, 350));
              window.location.href = `${SHOP_BASE}/account`;
            }}
            footer={
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => toast({ title: copy("contactSupportToResetYourPassword"), tone: "info" })}
                >

                  {copy("forgotPassword")}
                </button>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => toast({ title: copy("registrationIsComingSoon"), tone: "info" })}
                >

                  {copy("createAccount")}
                </button>
              </div>
            }
          />
        </div>

        <Text size="xs" tone="muted" className="text-center">

          {copy("demoModeEnterAnyEmailAndPasswordToSignIn")}
        </Text>
      </div>
    </main>
  );
}
