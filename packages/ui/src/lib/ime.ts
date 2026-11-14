// IME（中/日/韩输入法）合成中的按键判断 —— 组件内部实现，不进公共 API。
//
// 拼音等输入法里按 Enter 是"把候选上屏"，不是"提交/换行"。自定义 keydown 处理 Enter
// 的地方都要先过这道判断，否则中文用户敲到一半就被提交 / 插入换行。
//   - `isComposing`：标准判断（Chrome / Firefox / Edge）
//   - `keyCode === 229`：Safari 兜底 —— WebKit bug 165004 让 compositionend 先于
//     确认键的 keydown 送达，此时 isComposing 已复位为 false，但 keyCode 仍是 229
// 只应在已确认 `key === "Enter"`（或其他具体按键）后调用；移动端虚拟键盘普通输入也可能报 229。
// 参考：modern-web-guidance `ime-safe-enter-submit`。
export function isImeComposing(e: { nativeEvent?: KeyboardEvent; isComposing?: boolean; keyCode?: number }): boolean {
  const ev = e.nativeEvent ?? e;
  return Boolean(ev.isComposing) || ev.keyCode === 229;
}
