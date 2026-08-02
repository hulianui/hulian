"use client";
import { copy } from "./account-menu.content";

import { useRouter } from "next/navigation";
import { UserRound, Settings, LogOut } from "lucide-react";
import {
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  User,
  toast,
} from "@hulianui/ui";
import { CS_ROOT } from "./nav-config";

// 头像账号菜单：点击头像 → 个人中心 / 客服设置 / 退出登录。
export function AccountMenu() {
  const router = useRouter();

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label={copy("accountMenu")}
            className="h-auto gap-0 rounded-[var(--radius)] px-1.5 py-1"
          >
            <User
              name={copy("xiaoLian")}
              description={copy("seniorCustomerService")}
              avatarProps={{ fallback: copy("lian"), src: "/demo/avatar-1.jpg" }}
            />
          </Button>
        }
      />
      <MenuContent side="bottom" align="end" className="w-56">
        <div className="border-b border-border px-3 py-2">
          <div className="text-sm font-medium">{copy("xiaoLian2")}</div>
          <div className="text-xs text-muted">xiaolian@hulian.demo</div>
        </div>
        <MenuItem onClick={() => toast({ title: copy("personalCenter"), description: copy("theDemoEnvironmentDoesNotProvideThis"), tone: "neutral" })}>
          <UserRound className="size-4" />{copy("personalCenter2")}</MenuItem>
        <MenuItem onClick={() => router.push(`${CS_ROOT}/settings`)}>
          <Settings className="size-4" />{copy("customerServiceSettings")}</MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onClick={() => router.push(`${CS_ROOT}/login`)}>
          <LogOut className="size-4" />{copy("logOut")}</MenuItem>
      </MenuContent>
    </Menu>
  );
}
