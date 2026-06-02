import { describe, it, expect } from "vitest";
import { hulianMuiTheme } from "./theme";

describe("hulianMuiTheme（MUI 桥主题读瑚琏 var 单一真源）", () => {
  it("createTheme 不抛 + palette 槽位是瑚琏 CSS 变量", () => {
    expect(hulianMuiTheme.palette.primary.main).toBe("var(--color-primary)");
    expect(hulianMuiTheme.palette.primary.contrastText).toBe("var(--color-primary-foreground)");
    expect(hulianMuiTheme.palette.background.paper).toBe("var(--color-surface)");
    expect(hulianMuiTheme.palette.text.secondary).toBe("var(--color-muted)");
    expect(hulianMuiTheme.palette.divider).toBe("var(--color-border)");
  });
});
