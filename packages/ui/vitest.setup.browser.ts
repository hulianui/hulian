// browser mode 的 setup。
//
// 与 vitest.setup.ts（jsdom）最重要的区别：**这里一个 polyfill 都不打**。
// jsdom 那份 setup 为了让测试能跑，把 PointerEvent 降级成 MouseEvent、把 setPointerCapture
// 做成 no-op、把 IntersectionObserver 做成永不触发的桩 —— 真实浏览器里这些能力都是原生的，
// 再打桩等于把要测的东西亲手屏蔽掉。
//
// 这里只做两件事：加载真实样式、给根节点一个确定的主题。
import "./vitest.browser.css";

// 语义 token 挂在 [data-theme] 上，不设就取不到值，颜色/阴影类断言会全部失真。
document.documentElement.dataset.theme = "light";
document.documentElement.style.colorScheme = "light";

// 测试仍保留真实的 rAF、指针事件与布局；触发 React 更新的事件序列由各用例显式放进
// async act()，既不伪造浏览器能力，也确保断言观察到的是已经提交的 UI 状态。
