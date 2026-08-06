import { describe, it, expect, afterEach } from "vitest";
import {
  asElement,
  elementPath,
  escapeAttributeValue,
  findMarkedElement,
  pathLabel,
  resolveElementByPath,
  structuralPath,
} from "./element-path";

// jsdom 的 DOM 查询能力是完整可信的（parentElement / children / querySelector / nth-of-type），
// 所以路径这层在这里测得踏实；坐标那层一律不在这测（getBoundingClientRect 恒 0）。
function mount(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("asElement", () => {
  it("元素 → 自身", () => {
    const el = document.createElement("span");
    expect(asElement(el)).toBe(el);
  });
  it("文本节点 / null / 普通对象 → null", () => {
    expect(asElement(document.createTextNode("x"))).toBeNull();
    expect(asElement(null)).toBeNull();
    expect(asElement({ nodeType: 1 })).toBeNull();
  });
  it("认鸭子而非 instanceof（跨 realm 的 iframe 元素也能认）", () => {
    const fake = { nodeType: 1, tagName: "DIV" };
    expect(asElement(fake)).toBe(fake);
  });
});

describe("structuralPath", () => {
  it("单一路径不加 nth-of-type", () => {
    const root = mount("<section><button>a</button></section>");
    const btn = root.querySelector("button")!;
    expect(structuralPath(btn, root)).toBe("section > button");
  });

  it("同 tag 兄弟才加 nth-of-type，且按同 tag 计数", () => {
    const root = mount(
      "<div><p>x</p><section>1</section><section><button>a</button></section></div>",
    );
    const btn = root.querySelector("button")!;
    // section 是第 2 个 section（不是第 3 个 child）
    expect(structuralPath(btn, root)).toBe("div > section:nth-of-type(2) > button");
  });

  it("命中 id 祖先即锚定，不再上溯到 root", () => {
    const root = mount("<main><div id='panel'><span><b>x</b></span></div></main>");
    const b = root.querySelector("b")!;
    expect(structuralPath(b, root)).toBe("div#panel > span > b");
  });

  it("anchorOnId=false 给出从 root 起的完整链路", () => {
    const root = mount("<main><div id='panel'><span><b>x</b></span></div></main>");
    const b = root.querySelector("b")!;
    expect(structuralPath(b, root, { anchorOnId: false })).toBe("main > div > span > b");
  });

  it("数字开头的 id 不做锚点（选择器易错）", () => {
    const root = mount("<main><div id='9x'><b>x</b></div></main>");
    const b = root.querySelector("b")!;
    expect(structuralPath(b, root)).toBe("main > div > b");
  });

  it("root 自身 / root 之外的元素 → 空串", () => {
    const root = mount("<span>x</span>");
    const outside = document.createElement("i");
    document.body.appendChild(outside);
    expect(structuralPath(root, root)).toBe("");
    expect(structuralPath(outside, root)).toBe("");
  });

  it("产出的路径能被 root.querySelector 反查回同一个元素", () => {
    const root = mount(
      "<div><section>1</section><section><ul><li>a</li><li><button>b</button></li></ul></section></div>",
    );
    const btn = root.querySelector("button")!;
    const path = structuralPath(btn, root);
    expect(root.querySelector(path)).toBe(btn);
  });
});

describe("findMarkedElement", () => {
  it("向上找到最近的标记祖先", () => {
    const root = mount("<div data-hulian-path='A'><span><b>x</b></span></div>");
    const b = root.querySelector("b")!;
    expect(findMarkedElement(b, root, "data-hulian-path")).toBe(root.firstElementChild);
  });
  it("空值属性视为未标记", () => {
    const root = mount("<div data-hulian-path=''><b>x</b></div>");
    expect(findMarkedElement(root.querySelector("b")!, root, "data-hulian-path")).toBeNull();
  });
  it("不含 root 自身（否则所有元素都退化成同一条路径）", () => {
    const root = mount("<b>x</b>");
    root.setAttribute("data-hulian-path", "ROOT");
    expect(findMarkedElement(root.querySelector("b")!, root, "data-hulian-path")).toBeNull();
  });
});

describe("elementPath", () => {
  it("优先读标记，source=marked，element 上移到标记元素", () => {
    const root = mount(
      "<div data-hulian-path='App/Header' data-hulian-component='Header'><span><b>x</b></span></div>",
    );
    const b = root.querySelector("b")!;
    const result = elementPath(b, root)!;
    expect(result.path).toBe("App/Header");
    expect(result.source).toBe("marked");
    expect(result.component).toBe("Header");
    expect(result.element).toBe(root.firstElementChild);
  });

  it("无标记时回退结构化路径，source=structural", () => {
    const root = mount("<section><button>a</button></section>");
    const result = elementPath(root.querySelector("button")!, root)!;
    expect(result.path).toBe("section > button");
    expect(result.source).toBe("structural");
    expect(result.component).toBeNull();
  });

  it("只标了组件名没标路径 → 结构化路径 + 组件名", () => {
    const root = mount("<div data-hulian-component='Card'><button>a</button></div>");
    const result = elementPath(root.querySelector("button")!, root)!;
    expect(result.source).toBe("structural");
    expect(result.component).toBe("Card");
  });

  it("自定义属性名", () => {
    const root = mount("<div data-x='P'><b>x</b></div>");
    const result = elementPath(root.querySelector("b")!, root, { pathAttribute: "data-x" })!;
    expect(result).toMatchObject({ path: "P", source: "marked" });
  });

  it("root 自身与 root 之外 → null", () => {
    const root = mount("<b>x</b>");
    expect(elementPath(root, root)).toBeNull();
    expect(elementPath(document.body, root)).toBeNull();
  });
});

describe("resolveElementByPath", () => {
  it("标记路径按属性反查", () => {
    const root = mount("<div data-hulian-path='App/Header'><b>x</b></div>");
    expect(resolveElementByPath(root, "App/Header")).toBe(root.firstElementChild);
  });
  it("结构化路径按选择器反查", () => {
    const root = mount("<section><button>a</button></section>");
    expect(resolveElementByPath(root, "section > button")).toBe(root.querySelector("button"));
  });
  it("空串 / 查不到 / 非法选择器 → null，不抛错", () => {
    const root = mount("<b>x</b>");
    expect(resolveElementByPath(root, "")).toBeNull();
    expect(resolveElementByPath(root, "section > i")).toBeNull();
    expect(resolveElementByPath(root, ">>>")).toBeNull();
  });
  it("带引号的标记值不会破坏属性选择器", () => {
    const root = mount("<div><b>x</b></div>");
    const marked = root.firstElementChild!;
    marked.setAttribute("data-hulian-path", 'a"b');
    expect(resolveElementByPath(root, 'a"b')).toBe(marked);
  });
});

describe("escapeAttributeValue", () => {
  it("转义反斜杠与双引号", () => {
    expect(escapeAttributeValue('a"b\\c')).toBe('a\\"b\\\\c');
  });
});

describe("pathLabel", () => {
  it("有组件名优先用组件名", () => {
    expect(pathLabel("div > button", "SubmitButton")).toBe("SubmitButton");
  });
  it("无组件名取路径末段（> 与 / 都算分隔符）", () => {
    expect(pathLabel("div > section:nth-of-type(2) > button")).toBe("button");
    expect(pathLabel("App/Header/Logo")).toBe("Logo");
  });
  it("空路径 → 空串", () => {
    expect(pathLabel("")).toBe("");
  });
});
