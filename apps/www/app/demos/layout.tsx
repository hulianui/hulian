import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatedThemeToggler, Stack, Text } from "@hulian/ui";
import { ArrowLeft } from "lucide-react";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
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
            瑚琏 Demo
          </Text>
        </Link>
        <AnimatedThemeToggler />
      </Stack>
      {children}
    </div>
  );
}
