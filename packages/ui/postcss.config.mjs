// 仅供 vitest browser mode 使用：真实浏览器里跑测试需要真实样式，
// 否则 Tailwind 类不生效、元素塌成 0 尺寸，拖拽 / 布局 / 定位类断言全部失真。
// unit（jsdom）project 不 import 任何 css，因此不受影响。
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
