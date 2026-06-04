"use client";
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
} from "@hulian/ui";
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
            aria-label="账号菜单"
            className="h-auto gap-0 rounded-[var(--radius)] px-1.5 py-1"
          >
            <User
              name="小琏"
              description="高级客服"
              avatarProps={{ fallback: "琏", src: "/demo/avatar-1.jpg" }}
            />
          </Button>
        }
      />
      <MenuContent side="bottom" align="end" className="w-56">
        <div className="border-b border-border px-3 py-2">
          <div className="text-sm font-medium">小琏</div>
          <div className="text-xs text-muted">xiaolian@hulian.demo</div>
        </div>
        <MenuItem onClick={() => toast({ title: "个人中心", description: "demo 环境暂未提供该页面", tone: "neutral" })}>
          <UserRound className="size-4" /> 个人中心
        </MenuItem>
        <MenuItem onClick={() => router.push(`${CS_ROOT}/settings`)}>
          <Settings className="size-4" /> 客服设置
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onClick={() => router.push(`${CS_ROOT}/login`)}>
          <LogOut className="size-4" /> 退出登录
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
