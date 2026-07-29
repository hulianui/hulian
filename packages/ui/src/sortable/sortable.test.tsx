import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { InteractiveAwarePointerSensor, Sortable, shouldStartDragFrom } from "./sortable";

afterEach(cleanup);

interface Row {
  id: string;
  label: string;
}
const rows: Row[] = [
  { id: "a", label: "甲" },
  { id: "b", label: "乙" },
  { id: "c", label: "丙" },
];

describe("Sortable 渲染", () => {
  it("用 renderItem 渲染全部项，顺序与 items 一致", () => {
    const { container } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(3);
    expect(Array.from(lis).map((li) => li.textContent)).toEqual(["甲", "乙", "丙"]);
  });

  it("handle 模式：每项渲染可聚焦拖拽手柄，aria-label 带序号（多手柄读屏可区分）", () => {
    const { container, getByLabelText } = render(
      <Sortable items={rows} handle onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    expect(container.querySelectorAll("[data-sortable-handle]").length).toBe(3);
    expect(getByLabelText("拖拽排序（第 1 项）")).toBeTruthy();
    expect(getByLabelText("拖拽排序（第 3 项）")).toBeTruthy();
  });

  it("整项可拖模式：activator 落在 li 上（aria-roledescription=sortable），无独立手柄", () => {
    const { container, queryByLabelText } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const li = container.querySelector("li")!;
    expect(li.getAttribute("aria-roledescription")).toBe("sortable");
    expect(queryByLabelText("拖拽排序（第 1 项）")).toBeNull();
  });

  it("getId 自定义：不依赖 item.id 字段也能渲染", () => {
    const data = [{ key: "x", label: "X" }, { key: "y", label: "Y" }];
    const { container } = render(
      <Sortable
        items={data}
        getId={(d) => d.key}
        onChange={() => {}}
        renderItem={(d) => <span>{d.label}</span>}
      />,
    );
    expect(container.querySelectorAll("li").length).toBe(2);
  });

  it("挂载时不触发 onChange（仅拖拽/键盘移动后才触发）", () => {
    const onChange = vi.fn();
    render(<Sortable items={rows} onChange={onChange} renderItem={(r) => <span>{r.label}</span>} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renderItem 拿得到 index（消费方无需 findIndex 兜回来）", () => {
    const { container } = render(
      <Sortable
        items={rows}
        onChange={() => {}}
        renderItem={(r, s) => (
          <span>
            第 {s.index + 1} 项 · {r.label}
          </span>
        )}
      />,
    );
    expect(Array.from(container.querySelectorAll("li")).map((li) => li.textContent)).toEqual([
      "第 1 项 · 甲",
      "第 2 项 · 乙",
      "第 3 项 · 丙",
    ]);
  });

  it("横向：容器用 flex 布局", () => {
    const { container } = render(
      <Sortable
        items={rows}
        orientation="horizontal"
        onChange={() => {}}
        renderItem={(r) => <span>{r.label}</span>}
      />,
    );
    expect(container.querySelector("ul")!.className).toContain("flex");
  });
});

// jsdom 里 PointerSensor 不会真激活（缺真实指针事件序列），所以守卫逻辑抽成纯函数直接测。
describe("shouldStartDragFrom 交互元素守卫", () => {
  /** 造一行：li 为 activator 容器，innerHTML 为行内容，返回 [容器, 查询函数]。 */
  function row(html: string) {
    const li = document.createElement("li");
    li.innerHTML = html;
    return [li, (sel: string) => li.querySelector(sel)!] as const;
  }

  it("点在原生交互控件上 → 不发起拖拽", () => {
    const [li, q] = row(
      `<input /><textarea></textarea><select></select><button></button>
       <label></label><a href="#x"></a><div role="button"></div><div contenteditable=""></div>`,
    );
    for (const sel of ["input", "textarea", "select", "button", "label", "a", "[role='button']", "[contenteditable]"]) {
      expect(shouldStartDragFrom(q(sel), li)).toBe(false);
    }
  });

  it("点在交互元素的内层子节点上也算（closest 语义）", () => {
    const [li, q] = row(`<button><span class="t">删除</span></button>`);
    expect(shouldStartDragFrom(q(".t"), li)).toBe(false);
  });

  it("data-no-drag 逃生舱：非原生交互元素也能声明不拖", () => {
    const [li, q] = row(`<div data-no-drag class="canvas"></div>`);
    expect(shouldStartDragFrom(q(".canvas"), li)).toBe(false);
  });

  it("点在普通 div/span 上 → 正常发起拖拽", () => {
    const [li, q] = row(`<div class="wrap"><span class="txt">题干</span></div>`);
    expect(shouldStartDragFrom(q(".txt"), li)).toBe(true);
    expect(shouldStartDragFrom(q(".wrap"), li)).toBe(true);
    expect(shouldStartDragFrom(li, li)).toBe(true);
  });

  it("contenteditable=\"false\" 不算可编辑 → 正常发起拖拽", () => {
    const [li, q] = row(`<div contenteditable="false" class="ro">只读</div>`);
    expect(shouldStartDragFrom(q(".ro"), li)).toBe(true);
  });

  it("handle 模式：手柄本身是 <button> 但它就是容器，点手柄/手柄内图标都能拖", () => {
    const btn = document.createElement("button");
    btn.setAttribute("data-sortable-handle", "");
    btn.innerHTML = `<svg class="icon"></svg>`;
    expect(shouldStartDragFrom(btn, btn)).toBe(true);
    expect(shouldStartDragFrom(btn.querySelector(".icon"), btn)).toBe(true);
  });

  it("handle 模式：即使容器不是手柄自身（listeners 挂到祖先），data-sortable-handle 仍放行", () => {
    const [li, q] = row(`<button data-sortable-handle=""><svg class="icon"></svg></button>`);
    expect(shouldStartDragFrom(q("button"), li)).toBe(true);
    expect(shouldStartDragFrom(q(".icon"), li)).toBe(true);
  });

  it("向上查找止步于容器：列表被外层 <a>/<label> 包住也不会整体锁死", () => {
    const outer = document.createElement("a");
    outer.href = "#";
    const [li, q] = row(`<span class="txt">题干</span>`);
    outer.appendChild(li);
    expect(shouldStartDragFrom(q(".txt"), li)).toBe(true);
  });

  // 回归锁：dnd-kit 给整项可拖的 li 挂了 role="button"，若守卫把容器自身也测一遍，
  // 每一次拖拽都会被自己的 activator 挡光（表现为"整个组件拖不动"）。
  it("真实渲染的 li 自带 role=button，守卫不得因此挡掉自身的拖拽", () => {
    const { container } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const li = container.querySelector("li")!;
    expect(li.getAttribute("role")).toBe("button");
    expect(shouldStartDragFrom(li.querySelector("span"), li)).toBe(true);
  });

  it("target 不是 Element（null / document）→ 放行，不误挡", () => {
    const li = document.createElement("li");
    expect(shouldStartDragFrom(null, li)).toBe(true);
    expect(shouldStartDragFrom(document, li)).toBe(true);
  });
});

// 守卫真正生效的位置是 sensor 的 activator；直接喂合成事件，锁住「返回 false 且不激活」的接线，
// 免得纯函数是对的、但没接上（或返回值取反）。
// 指针守卫只挡住了鼠标/触屏那条路。键盘是另一条完全独立的通路，dnd-kit 的 KeyboardSensor
// 靠 activatorNode 判「这次按键是不是冲着拖拽来的」，而 activatorNode 为 null 时它整条守卫会被跳过。
// 下面两条锁住的就是这个：行内按钮上的回车必须还给按钮，li 自身上的回车才算起拖。
describe("键盘路径不劫持行内交互元素（issue #26）", () => {
  function pressEnter(el: Element) {
    const ev = new KeyboardEvent("keydown", { code: "Enter", key: "Enter", bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    return ev;
  }

  it("整项可拖 + 行内按钮：按钮上按回车不被 preventDefault（否则键盘用户永远点不动它）", () => {
    const { getAllByText } = render(
      <Sortable
        items={rows}
        onChange={() => {}}
        renderItem={(r) => (
          <span>
            {r.label}
            <button type="button">删除</button>
          </span>
        )}
      />,
    );
    // 三行各有一颗删除钮，取第一颗即可
    expect(pressEnter(getAllByText("删除")[0]).defaultPrevented).toBe(false);
  });

  it("整项可拖：li 自身被登记为 activatorNode，落在它上面的回车才进入键盘拖拽", () => {
    const { container } = render(
      <Sortable items={rows} onChange={() => {}} renderItem={(r) => <span>{r.label}</span>} />,
    );
    const li = container.querySelector("li")!;
    li.focus();
    expect(pressEnter(li).defaultPrevented).toBe(true);
  });
});

describe("InteractiveAwarePointerSensor activator", () => {
  const [{ eventName, handler }] = InteractiveAwarePointerSensor.activators;

  /** 伪造一枚 React 合成 pointerdown：target=按下的元素，currentTarget=挂 listeners 的元素。 */
  function pointerDown(target: Element, currentTarget: Element) {
    return {
      target,
      currentTarget,
      nativeEvent: { isPrimary: true, button: 0 },
    } as unknown as Parameters<typeof handler>[0];
  }

  function row(html: string) {
    const li = document.createElement("li");
    li.innerHTML = html;
    return li;
  }

  it("挂在 onPointerDown 上（与上游 PointerSensor 一致）", () => {
    expect(eventName).toBe("onPointerDown");
  });

  it("按在行内输入框上：不激活，也不调 onActivation", () => {
    const li = row(`<input class="score" />`);
    const onActivation = vi.fn();
    expect(handler(pointerDown(li.querySelector(".score")!, li), { onActivation })).toBe(false);
    expect(onActivation).not.toHaveBeenCalled();
  });

  it("按在普通内容上：正常激活", () => {
    const li = row(`<span class="txt">题干</span>`);
    const onActivation = vi.fn();
    expect(handler(pointerDown(li.querySelector(".txt")!, li), { onActivation })).toBe(true);
    expect(onActivation).toHaveBeenCalledTimes(1);
  });

  it("handle 模式：currentTarget 是手柄按钮自身，仍正常激活", () => {
    const btn = document.createElement("button");
    btn.setAttribute("data-sortable-handle", "");
    expect(handler(pointerDown(btn, btn), {})).toBe(true);
  });

  it("非主指针 / 非左键：沿用上游语义，不激活", () => {
    const li = row(`<span class="txt">题干</span>`);
    const txt = li.querySelector(".txt")!;
    const e = pointerDown(txt, li) as unknown as { nativeEvent: { isPrimary: boolean; button: number } };
    e.nativeEvent.isPrimary = false;
    expect(handler(e as unknown as Parameters<typeof handler>[0], {})).toBe(false);
    e.nativeEvent.isPrimary = true;
    e.nativeEvent.button = 2;
    expect(handler(e as unknown as Parameters<typeof handler>[0], {})).toBe(false);
  });
});
