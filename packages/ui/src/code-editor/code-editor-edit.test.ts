import { describe, it, expect } from "vitest";
import {
  applyEdit,
  autoPairEdit,
  backspacePairEdit,
  getLanguageRules,
  indentEdit,
  lineEndAt,
  lineStartAt,
  newlineEdit,
  outdentEdit,
  selectedLineBlock,
  toggleCommentEdit,
  type EditorEdit,
  type EditorState,
} from "./code-editor-edit";

const ts = getLanguageRules("tsx", 2);
const json = getLanguageRules("json", 2);
const css = getLanguageRules("css", 2);

/** 用 `|` 标光标、`[` `]` 标选区，写用例时比手数下标可靠。 */
function state(marked: string): EditorState {
  const caret = marked.indexOf("|");
  if (caret !== -1) {
    const value = marked.replace("|", "");
    return { value, selectionStart: caret, selectionEnd: caret };
  }
  const start = marked.indexOf("[");
  const end = marked.indexOf("]") - 1;
  return { value: marked.replace("[", "").replace("]", ""), selectionStart: start, selectionEnd: end };
}

/** 把编辑结果重新标注回 `|` / `[]` 形式，断言时一眼能看出光标落点。 */
function mark(next: EditorState): string {
  const { value, selectionStart, selectionEnd } = next;
  if (selectionStart === selectionEnd) {
    return value.slice(0, selectionStart) + "|" + value.slice(selectionStart);
  }
  return (
    value.slice(0, selectionStart) +
    "[" +
    value.slice(selectionStart, selectionEnd) +
    "]" +
    value.slice(selectionEnd)
  );
}

const run = (s: EditorState, edit: EditorEdit | null) => mark(applyEdit(s, edit!));

describe("行定位工具", () => {
  const v = "aa\nbbbb\ncc";
  it("lineStartAt / lineEndAt", () => {
    expect(lineStartAt(v, 4)).toBe(3);
    expect(lineEndAt(v, 4)).toBe(7);
  });
  it("选区停在下一行行首时不把那一行算进来", () => {
    const block = selectedLineBlock({ value: v, selectionStart: 0, selectionEnd: 3 });
    expect(v.slice(block.start, block.end)).toBe("aa");
  });
  it("折叠光标只覆盖当前行", () => {
    const block = selectedLineBlock({ value: v, selectionStart: 5, selectionEnd: 5 });
    expect(v.slice(block.start, block.end)).toBe("bbbb");
  });
});

describe("getLanguageRules", () => {
  it("JSON 无注释符（写进去就是非法 JSON）", () => {
    expect(json.lineComment).toBeNull();
    expect(json.blockComment).toBeNull();
  });
  it("CSS 只有块注释", () => {
    expect(css.lineComment).toBeNull();
    expect(css.blockComment).toEqual(["/*", "*/"]);
  });
  it("未知语言按 JS 家族兜底", () => expect(getLanguageRules("rust", 2).lineComment).toBe("//"));
  it("indentSize 决定缩进单位", () => expect(getLanguageRules("ts", 4).indent).toBe("    "));
});

describe("indentEdit / outdentEdit", () => {
  it("无选区 → 光标处插入一级缩进", () => {
    expect(run(state("ab|cd"), indentEdit(state("ab|cd"), ts))).toBe("ab  |cd");
  });
  it("单行选区 → 替换成缩进（与主流编辑器一致）", () => {
    const s = state("a[bc]d");
    expect(run(s, indentEdit(s, ts))).toBe("a  |d");
  });
  it("跨行选区 → 逐行加缩进，选区跟着扩", () => {
    const s = state("[a\nb]\nc");
    expect(run(s, indentEdit(s, ts))).toBe("[  a\n  b]\nc");
  });
  it("跨行缩进跳过空行（不留尾随空格）", () => {
    const s = state("[a\n\nb]");
    expect(applyEdit(s, indentEdit(s, ts)).value).toBe("  a\n\n  b");
  });
  it("反缩进逐行剥掉一级", () => {
    const s = state("[  a\n  b]");
    expect(applyEdit(s, outdentEdit(s, ts)!).value).toBe("a\nb");
  });
  it("反缩进只有一个空格时也剥掉（不足一级按实际剥）", () => {
    const s = state(" a|");
    expect(applyEdit(s, outdentEdit(s, ts)!).value).toBe("a");
  });
  it("已在行首 → 返回 null，不产生空编辑", () => {
    expect(outdentEdit(state("a|"), ts)).toBeNull();
  });
  it("反缩进对折叠光标也生效（作用于当前行）", () => {
    const s = state("x\n    y|");
    expect(applyEdit(s, outdentEdit(s, ts)!).value).toBe("x\n  y");
  });
});

describe("newlineEdit", () => {
  it("沿用上一行缩进", () => {
    const s = state("  foo|");
    expect(run(s, newlineEdit(s, ts))).toBe("  foo\n  |");
  });
  it("{ 之后多缩一级", () => {
    const s = state("if (a) {|");
    expect(run(s, newlineEdit(s, ts))).toBe("if (a) {\n  |");
  });
  it("光标夹在 {} 中间 → 闭合符推到下一行并回退一级", () => {
    const s = state("  if (a) {|}");
    expect(run(s, newlineEdit(s, ts))).toBe("  if (a) {\n    |\n  }");
  });
  it("[ 与 ( 同理", () => {
    const s = state("const a = [|]");
    expect(run(s, newlineEdit(s, ts))).toBe("const a = [\n  |\n]");
  });
  it("光标停在缩进中间时不凭空加深缩进", () => {
    const s = state("  | foo");
    expect(run(s, newlineEdit(s, ts))).toBe("  \n  | foo");
  });
});

describe("autoPairEdit", () => {
  it("行尾输入 { 自动补 }，光标落中间", () => {
    const s = state("a|");
    expect(run(s, autoPairEdit(s, "{", ts))).toBe("a{|}");
  });
  it("下一个字符是标识符时不自动闭合", () => {
    expect(autoPairEdit(state("|foo"), "(", ts)).toBeNull();
  });
  it("有选区 → 包裹而非替换，且内部文本仍被选中", () => {
    const s = state("x [ab] y");
    expect(run(s, autoPairEdit(s, "(", ts))).toBe("x ([ab]) y");
  });
  it("引号包裹选区", () => {
    const s = state("[ab]");
    expect(run(s, autoPairEdit(s, '"', ts))).toBe('"[ab]"');
  });
  it("贴着同款闭合符 → type-over 只挪光标", () => {
    const s = state("f(|)");
    const edit = autoPairEdit(s, ")", ts)!;
    expect(edit.text).toBe("");
    expect(run(s, edit)).toBe("f()|");
  });
  it("引号 type-over", () => {
    const s = state('"ab|"');
    expect(run(s, autoPairEdit(s, '"', ts))).toBe('"ab"|');
  });
  it("撇号紧跟单词不闭合（it's 不会变成 it''s）", () => {
    expect(autoPairEdit(state("it|"), "'", ts)).toBeNull();
  });
  it("JSON 不把反引号当引号", () => {
    expect(autoPairEdit(state("|"), "`", json)).toBeNull();
  });
  it("普通字符返回 null（交给浏览器默认插入）", () => {
    expect(autoPairEdit(state("|"), "a", ts)).toBeNull();
  });
});

describe("backspacePairEdit", () => {
  it("夹在空括号中间 → 两个一起删", () => {
    const s = state("f({|})");
    expect(run(s, backspacePairEdit(s, ts))).toBe("f(|)");
  });
  it("夹在空引号中间 → 两个一起删", () => {
    const s = state("a = \"|\"");
    expect(run(s, backspacePairEdit(s, ts))).toBe("a = |");
  });
  it("括号里有内容 → null（走默认退格）", () => {
    expect(backspacePairEdit(state("(a|)"), ts)).toBeNull();
  });
  it("有选区 → null", () => {
    expect(backspacePairEdit(state("([a])"), ts)).toBeNull();
  });
});

describe("toggleCommentEdit", () => {
  it("单行加行注释", () => {
    const s = state("const a = 1|");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("// const a = 1");
  });
  it("再切一次取消（含注释符后的空格）", () => {
    const s = state("// const a = 1|");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("const a = 1");
  });
  it("多行统一对齐到最小缩进列", () => {
    const s = state("[  a\n    b]");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("  // a\n  //   b");
  });
  it("只要有一行未注释就整体加注释", () => {
    const s = state("[// a\nb]");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("// // a\n// b");
  });
  it("全部已注释才取消", () => {
    const s = state("[// a\n// b]");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("a\nb");
  });
  it("空行不动", () => {
    const s = state("[a\n\nb]");
    expect(applyEdit(s, toggleCommentEdit(s, ts)!).value).toBe("// a\n\n// b");
  });
  it("CSS 降级为逐行块注释包裹", () => {
    const s = state("color: red;|");
    expect(applyEdit(s, toggleCommentEdit(s, css)!).value).toBe("/* color: red; */");
  });
  it("CSS 块注释可原样切回", () => {
    const s = state("/* color: red; */|");
    expect(applyEdit(s, toggleCommentEdit(s, css)!).value).toBe("color: red;");
  });
  it("JSON 无注释符 → null，什么都不做", () => {
    expect(toggleCommentEdit(state("{}|"), json)).toBeNull();
  });
  it("全空行 → null", () => {
    expect(toggleCommentEdit(state("|"), ts)).toBeNull();
  });
});
