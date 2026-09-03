import { describe, it, expect, afterEach } from "vitest";
import { act, render, cleanup, waitFor } from "@testing-library/react";
import { Dialog, DialogContent } from "./dialog";

/**
 * 真实浏览器里的「拖开之后遮罩让开」（#346）。
 *
 * 为什么这条测试不能待在 jsdom：jsdom 那份只能断言「类名挂上了、data 属性写上了」——
 * 类名到底有没有编出规则、`[data-dragged]` 这一层特指度压不压得住基础色、
 * `backdrop-blur-none` 撤模糊后 `backdrop-filter` 的计算值是不是真的 `none`，
 * 三件事全要真实 CSS 才看得见。而这三件里任何一件不成立，用户看到的就还是
 * 「拖动了，但底下依旧糊成一片」—— 也就是这次要修的那个症状本身。
 */

afterEach(cleanup);

function firePointer(
  target: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  x: number,
  y: number,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerup" ? 0 : 1,
      clientX: x,
      clientY: y,
    }),
  );
}

/** 同文档里拿一个只有该类的探针，读出浏览器解析后的颜色 —— 免得去猜 color-mix 的计算值形态。 */
function colorOf(className: string): string {
  const probe = document.createElement("div");
  probe.className = className;
  document.body.append(probe);
  const color = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return color;
}

function backdropEl(): HTMLElement {
  const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
  const layers = Array.from(document.querySelectorAll<HTMLElement>(".fixed.inset-0"));
  return layers.find((el) => el !== popup)!;
}

describe("DialogContent draggable 的遮罩（真实 CSS）", () => {
  it("拖开之后遮罩让开：浓度 40% → 10%，模糊撤到 none", async () => {
    render(
      <Dialog open>
        <DialogContent title="选择附件" draggable>
          <p>正文</p>
        </DialogContent>
      </Dialog>,
    );
    const backdrop = backdropEl();
    const dim40 = colorOf("bg-black/40");
    const dim10 = colorOf("bg-black/10");
    expect(dim40).not.toBe(dim10);

    // 开着但没拖：层次感一点不变。
    expect(getComputedStyle(backdrop).backgroundColor).toBe(dim40);
    expect(getComputedStyle(backdrop).backdropFilter).toContain("blur(");
    // 浓度要能过渡，否则拖动那一刻是硬跳（见 motion/transition.ts 的 backdrop）。
    expect(getComputedStyle(backdrop).transitionProperty).toContain("background-color");

    const title = document.querySelector<HTMLElement>("[data-drag-handle]")!;
    const rect = title.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    await act(async () => {
      firePointer(title, "pointerdown", x, y);
    });
    // 只按下不算动。
    expect(backdrop.hasAttribute("data-dragged")).toBe(false);

    await act(async () => {
      firePointer(title, "pointermove", x + 120, y + 60);
      firePointer(title, "pointerup", x + 120, y + 60);
    });

    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(popup.style.left).not.toBe("");
    expect(backdrop.hasAttribute("data-dragged")).toBe(true);
    // 浓度走 200ms 过渡，取样要等它收敛（中途读到的是合成色）。
    await waitFor(() => expect(getComputedStyle(backdrop).backgroundColor).toBe(dim10));
    // 模糊不参与过渡，撤掉即刻生效。
    expect(getComputedStyle(backdrop).backdropFilter).toBe("none");
  });

  it("不可拖的对话框：遮罩规则不变", () => {
    render(
      <Dialog open>
        <DialogContent title="确认删除">
          <p>正文</p>
        </DialogContent>
      </Dialog>,
    );
    const backdrop = backdropEl();
    expect(getComputedStyle(backdrop).backgroundColor).toBe(colorOf("bg-black/40"));
    expect(getComputedStyle(backdrop).backdropFilter).toContain("blur(");
  });
});
