import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";
import { useTheme } from "./use-theme";

function Probe() {
  const { theme, toggle } = useTheme();
  return (
    <button data-theme-value={theme} onClick={toggle}>
      t
    </button>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeProvider", () => {
  it("sets data-theme on html and toggles + persists", async () => {
    render(
      <ThemeProvider defaultSetting="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    await act(async () => {
      screen.getByText("t").click();
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("hulian-theme")).toBe("dark");
  });
});
