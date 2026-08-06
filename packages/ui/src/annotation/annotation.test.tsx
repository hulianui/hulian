import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Annotation } from "./annotation";
import {
  ARROWS,
  ARROW_H,
  ARROW_W,
  annotationGeometry,
  isDiagonal,
  sideVector,
} from "./annotation.geometry";
import type { AnnotationSide } from "./annotation.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const SIDES: AnnotationSide[] = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];

const geo = (side: AnnotationSide, over: Partial<Parameters<typeof annotationGeometry>[0]> = {}) =>
  annotationGeometry({ side, gap: 5, labelGap: 6, offsetX: 0, offsetY: 0, ...over });

/** calc 表达式里所有 px 项之和 —— 距目标边界多远。百分比项八个方位都一样，不参与比较。 */
const px = (expr: string) =>
  [...expr.matchAll(/(-?\d+)px/g)].reduce((sum, [, n]) => sum + Number(n), 0);

describe("sideVector", () => {
  it("把方位拆成 -1/0/1 的水平垂直分量", () => {
    expect(sideVector("n")).toEqual([0, -1]);
    expect(sideVector("s")).toEqual([0, 1]);
    expect(sideVector("e")).toEqual([1, 0]);
    expect(sideVector("w")).toEqual([-1, 0]);
    expect(sideVector("se")).toEqual([1, 1]);
    expect(sideVector("nw")).toEqual([-1, -1]);
  });

  it("只有四个对角方位两轴都非零", () => {
    expect(SIDES.filter(isDiagonal)).toEqual(["ne", "se", "sw", "nw"]);
  });
});

describe("ARROWS", () => {
  it("八个方位各有一条箭头", () => {
    expect(Object.keys(ARROWS).sort()).toEqual([...SIDES].sort());
  });

  it("首尾特征点都落在画框内", () => {
    for (const side of SIDES) {
      const { headPoint, tailPoint } = ARROWS[side];
      for (const [x, y] of [headPoint, tailPoint]) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(ARROW_W);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(ARROW_H);
      }
    }
  });

  it("箭头头端总在标签的反侧 —— 即指回目标", () => {
    for (const side of SIDES) {
      const { headPoint, tailPoint } = ARROWS[side];
      const [vx, vy] = sideVector(side);
      // 标签在东边（vx=1）时，箭头应从右指向左：head.x < tail.x
      if (vx !== 0) expect(Math.sign(tailPoint[0] - headPoint[0])).toBe(vx);
      if (vy !== 0) expect(Math.sign(tailPoint[1] - headPoint[1])).toBe(vy);
    }
  });
});

describe("annotationGeometry", () => {
  it("每根轴只用 left/right、top/bottom 之一定位", () => {
    for (const side of SIDES) {
      const { arrow, label } = geo(side);
      for (const box of [arrow, label]) {
        expect(box.left !== undefined && box.right !== undefined).toBe(false);
        expect(box.top !== undefined && box.bottom !== undefined).toBe(false);
        expect(box.left ?? box.right).toBeDefined();
        expect(box.top ?? box.bottom).toBeDefined();
      }
    }
  });

  it("锚定在朝向标签的那一边：向东伸用 left、向西伸用 right", () => {
    expect(geo("e").label.left).toBeDefined();
    expect(geo("e").label.right).toBeUndefined();
    expect(geo("w").label.right).toBeDefined();
    expect(geo("w").label.left).toBeUndefined();
    expect(geo("s").label.top).toBeDefined();
    expect(geo("n").label.bottom).toBeDefined();
  });

  it("正方位在无关的那根轴上居中（50% + translate）", () => {
    expect(geo("s").label.left).toBe("50%");
    expect(geo("s").label.transform).toBe("translateX(-50%)");
    expect(geo("e").label.top).toBe("50%");
    expect(geo("e").label.transform).toBe("translateY(-50%)");
  });

  it("对角方位两轴都锚在目标角上，不做居中", () => {
    const { label } = geo("se");
    expect(label.transform).toBeUndefined();
    expect(label.left).toContain("100%");
    expect(label.top).toContain("100%");
  });

  it("标签比箭头更远离目标 —— 中间要放得下整根箭头", () => {
    // side="s"：两者都用 top 锚定，比较 calc 里的 px 常数即可
    const arrowTop = geo("s").arrow.top!;
    const labelTop = geo("s").label.top!;
    expect(px(labelTop) - px(arrowTop)).toBeGreaterThanOrEqual(ARROW_H - 6);
  });

  it("标签朝远离目标的方向对齐，变长时不会压回目标", () => {
    expect(geo("ne").label.textAlign).toBe("left");
    expect(geo("nw").label.textAlign).toBe("right");
    expect(geo("n").label.textAlign).toBe("center");
  });

  it("gap 变大时箭头与标签同步外推", () => {
    const near = geo("s", { gap: 5 }).arrow.top!;
    const far = geo("s", { gap: 25 }).arrow.top!;
    expect(px(far) - px(near)).toBe(20);
  });

  it("offset 沿 side 方向生效：正值远离目标，两侧对称", () => {
    const east = geo("e", { offsetX: 10 }).arrow.left!;
    const west = geo("w", { offsetX: 10 }).arrow.right!;
    // 目标两侧各自向外推同样的距离 —— 不是一边推开一边压近
    expect(px(east)).toBe(px(west));
    expect(px(east) - px(geo("e").arrow.left!)).toBe(10);
  });

  it("0 值不会污染 calc 表达式", () => {
    expect(geo("s").label.left).toBe("50%");
    expect(geo("s").arrow.left).not.toContain("0px");
  });
});

describe("<Annotation />", () => {
  it("稳定父更新时跳过标注子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <Annotation note="稳定 ID" side="ne" tone="primary">
        CLI-042
      </Annotation>
    ));
  });

  it("渲染被标注的内容与标签文本", () => {
    render(<Annotation note="稳定 ID">CLI-042</Annotation>);
    expect(screen.getByText("CLI-042")).toBeTruthy();
    expect(screen.getByText("稳定 ID")).toBeTruthy();
  });

  it("标签是真实节点，可以放 ReactNode 而不只是字符串", () => {
    render(<Annotation note={<b data-testid="rich">自定义字段</b>}>@blocked_by</Annotation>);
    expect(screen.getByTestId("rich")).toBeTruthy();
  });

  it("不给 note 时只留荧光笔底色，不画箭头与标签", () => {
    const { container } = render(<Annotation>只圈不注</Annotation>);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("只圈不注")).toBeTruthy();
  });

  it("note 为空字符串同样不画箭头（避免渲染出一根指着空气的箭头）", () => {
    const { container } = render(<Annotation note="">目标</Annotation>);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("mark=false 去掉底色但保留标注", () => {
    const { container } = render(
      <Annotation note="旁注" mark={false}>
        目标
      </Annotation>,
    );
    const host = container.firstElementChild!;
    expect(host.className).not.toContain("bg-(--hl-ann-mark)");
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("荧光笔外扩量走变量，className 能收窄它（相邻标注底色连片时用）", () => {
    const { container } = render(
      // 单位不能省：calc(-1 * 0) 是 <number> 不是 <length>，box-shadow 会拒收
      <Annotation note="旁注" className="[--hl-ann-spread:0px]">
        目标
      </Annotation>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("[--hl-ann-spread:0px]");
    // 默认值被覆盖掉，不能两条并存 —— 否则谁生效取决于 CSS 里的顺序
    expect(cls).not.toContain("[--hl-ann-spread:0.3em]");
  });

  it("箭头对读屏隐藏 —— 它是装饰，信息在标签里", () => {
    const { container } = render(<Annotation note="旁注">目标</Annotation>);
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
  });

  it("换 side 换掉箭头曲线，八向都画得出来", () => {
    for (const side of SIDES) {
      const { container, unmount } = render(
        <Annotation note="旁注" side={side}>
          目标
        </Annotation>,
      );
      const stem = container.querySelector("svg path")!;
      expect(stem.getAttribute("d")).toBe(ARROWS[side].stem);
      unmount();
    }
  });

  it("rotate 与方位自带的位移叠加，不互相覆盖", () => {
    const { container } = render(
      <Annotation note="旁注" side="s" rotate={-10}>
        目标
      </Annotation>,
    );
    const label = screen.getByText("旁注");
    expect(label.style.transform).toContain("translateX(-50%)");
    expect(label.style.transform).toContain("rotate(-10deg)");
    expect(container).toBeTruthy();
  });

  it("rotate=0 也不留空的 rotate 声明", () => {
    render(
      <Annotation note="旁注" side="e" rotate={0}>
        目标
      </Annotation>,
    );
    expect(screen.getByText("旁注").style.transform).toContain("rotate(0deg)");
  });

  it("labelWidth 控制折行阈值", () => {
    render(
      <Annotation note="很长的一段说明文字" labelWidth={90}>
        目标
      </Annotation>,
    );
    expect(screen.getByText("很长的一段说明文字").style.maxWidth).toBe("90px");
  });

  it("handwritten=false 时不套手写字体栈", () => {
    render(
      <Annotation note="旁注" handwritten={false}>
        目标
      </Annotation>,
    );
    expect(screen.getByText("旁注").className).not.toContain("--hl-annotation-font");
  });

  it("tone 只改标注自身的色，不给被标注内容染色", () => {
    const { container } = render(
      <Annotation note="旁注" tone="danger">
        目标
      </Annotation>,
    );
    const host = container.firstElementChild!;
    // 色只经 --hl-ann-color 下发；宿主不设 text-*，否则正文会跟着变色
    expect(host.className).toContain("[--hl-ann-color:var(--color-danger)]");
    expect(host.className).not.toMatch(/(^|\s)text-danger(\s|$)/);
  });

  it("as 换宿主标签", () => {
    const { container } = render(
      <Annotation note="旁注" as="mark">
        目标
      </Annotation>,
    );
    expect(container.firstElementChild!.tagName).toBe("MARK");
  });

  it("className 落到宿主、labelClassName 落到标签", () => {
    const { container } = render(
      <Annotation note="旁注" className="host-x" labelClassName="label-x">
        目标
      </Annotation>,
    );
    expect(container.firstElementChild!.className).toContain("host-x");
    expect(screen.getByText("旁注").className).toContain("label-x");
  });

  it("可以嵌套：一个目标挂多条方位不同的标注", () => {
    const { container } = render(
      <Annotation note="外层" side="n">
        <Annotation note="内层" side="s">
          目标
        </Annotation>
      </Annotation>,
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(screen.getByText("外层")).toBeTruthy();
    expect(screen.getByText("内层")).toBeTruthy();
  });
});
