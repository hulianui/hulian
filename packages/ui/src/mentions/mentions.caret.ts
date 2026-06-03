// 光标像素坐标 —— 镜像 div 法（经典 textarea-caret-position 思路）。
// 难点：textarea 无原生 API 取光标像素位置 → 造一个隐藏 div 完整复刻 textarea 的盒模型/字体/换行，
// 文本填到光标处后插一个 marker span，量 span 的 offsetTop/offsetLeft 即光标坐标（相对 textarea padding box）。
// 几何依赖真实布局：jsdom 下 offset* 恒 0、lineHeight 可能为 "normal"（NaN）——已兜底，靠截图验证真实渲染。

// 复刻这些 CSS 属性令镜像 div 的换行/字距与 textarea 逐像素一致。
const MIRRORED_PROPERTIES = [
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
] as const;

export interface CaretCoordinates {
  /** 相对 textarea padding box 顶部（含上边框）。 */
  top: number;
  /** 相对 textarea padding box 左侧（含左边框）。 */
  left: number;
  /** 当前行高（用于把浮层落到光标行下方）。 */
  height: number;
}

export function getCaretCoordinates(element: HTMLTextAreaElement, position: number): CaretCoordinates {
  const doc = element.ownerDocument;
  const win = doc.defaultView ?? window;
  const computed = win.getComputedStyle(element);

  const div = doc.createElement("div");
  doc.body.appendChild(div);
  const style = div.style;

  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  style.overflow = "hidden";
  for (const prop of MIRRORED_PROPERTIES) {
    // computed[prop] 在各浏览器返回带单位字符串，直接拷给 div.style 即可。
    style[prop as never] = computed[prop as never];
  }

  div.textContent = element.value.slice(0, position);
  const span = doc.createElement("span");
  // span 必须有内容才有几何；用光标后第一个字符（或占位 "."）撑出高度。
  span.textContent = element.value.slice(position) || ".";
  div.appendChild(span);

  const lineHeight = parseInt(computed.lineHeight, 10);
  const fontSize = parseInt(computed.fontSize, 10);
  const height = Number.isNaN(lineHeight) ? Math.round((fontSize || 16) * 1.2) : lineHeight;

  const coords: CaretCoordinates = {
    top: span.offsetTop + (parseInt(computed.borderTopWidth, 10) || 0),
    left: span.offsetLeft + (parseInt(computed.borderLeftWidth, 10) || 0),
    height,
  };

  doc.body.removeChild(div);
  return coords;
}
