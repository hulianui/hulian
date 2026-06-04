"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatedThemeToggler, Fab, Stack, Text } from "@hulian/ui";
import { ArrowLeft, LayoutGrid } from "lucide-react";

// /demos 路由的统一外壳 chrome（client，单挂在 demos/layout）：
// - 画廊页 `/demos` 本身 → 顶栏（返回首页 + 主题切换），作为画廊自己的页眉；
// - 任意 demo 子页 `/demos/<slug>/…` → 不占布局的「返回示例库」悬浮 Fab 胶囊，
//   各 demo 自带主题切换，故此处只管「回画廊」。
export function DemosChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const onGallery = pathname === "/demos";
  // ai-workflow 是全屏工作室、底部常驻运行面板，悬浮 Fab 会盖住面板，
  // 故其「返回示例库」改放工作室顶栏（见 studio-shell），此处不渲染悬浮件。
  const ownsBackAffordance = pathname.startsWith("/demos/ai-workflow");

  if (ownsBackAffordance) return null;

  if (onGallery) {
    return (
      <Stack
        as="header"
        direction="row"
        align="center"
        justify="between"
        className="border-b border-border px-6 py-3"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          <Text as="span" weight="medium">
            瑚琏首页
          </Text>
        </Link>
        <AnimatedThemeToggler />
      </Stack>
    );
  }

  return (
    <Fab
      label="返回示例库"
      icon={<LayoutGrid className="size-5" aria-hidden />}
      position="bottom-left"
      aria-label="返回示例库"
      onClick={() => router.push("/demos")}
    />
  );
}
