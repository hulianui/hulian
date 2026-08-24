import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { DotField } from "./dot-field";

afterEach(cleanup);

describe("DotField positioning (#327)", () => {
  it("填满由正文撑高的父容器且不参与文档流", () => {
    const { container } = render(
      <div
        data-testid="host"
        style={{ position: "relative", width: 320, padding: "24px 16px" }}
      >
        <div data-testid="content" style={{ height: 96 }}>
          正文
        </div>
        <DotField data-testid="field" />
      </div>,
    );
    const host = container.querySelector<HTMLElement>('[data-testid="host"]')!;
    const content = container.querySelector<HTMLElement>('[data-testid="content"]')!;
    const field = container.querySelector<HTMLElement>('[data-testid="field"]')!;
    const canvas = field.querySelector("canvas")!;
    const expectSameBounds = (actual: DOMRect, expected: DOMRect) => {
      expect(actual.left).toBeCloseTo(expected.left);
      expect(actual.top).toBeCloseTo(expected.top);
      expect(actual.width).toBeCloseTo(expected.width);
      expect(actual.height).toBeCloseTo(expected.height);
    };

    expect(host.offsetHeight).toBe(content.offsetHeight + 48);
    expectSameBounds(field.getBoundingClientRect(), host.getBoundingClientRect());
    expectSameBounds(canvas.getBoundingClientRect(), field.getBoundingClientRect());
    expect(getComputedStyle(field).pointerEvents).toBe("auto");
  });

  it("pointermove 会改变真实 canvas 的绘制结果", async () => {
    const { container } = render(
      <div style={{ position: "relative", width: 240, height: 160 }}>
        <DotField
          data-testid="field"
          dotRadius={2}
          dotSpacing={10}
          cursorRadius={140}
          bulgeStrength={96}
          glowRadius={0}
          waveAmplitude={0}
          sparkle={false}
        />
      </div>,
    );
    const canvas = container.querySelector<HTMLCanvasElement>("canvas")!;

    await waitFor(() => {
      expect(canvas.width).toBeGreaterThan(1);
      expect(canvas.height).toBeGreaterThan(1);

      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      expect(canvas.toDataURL()).not.toBe(blank.toDataURL());
    });
    const beforePointerMove = canvas.toDataURL();
    const rect = canvas.getBoundingClientRect();

    await act(async () => {
      canvas.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          pointerId: 1,
          pointerType: "mouse",
          isPrimary: true,
        }),
      );
    });

    // canvas 像素变化不会触发 DOM MutationObserver；waitFor 的轮询让断言跨过
    // requestAnimationFrame，同时避免把生产动画时序写死成固定延迟。
    await waitFor(
      () => expect(canvas.toDataURL()).not.toBe(beforePointerMove),
      { interval: 20, timeout: 3_000 },
    );
  });
});
