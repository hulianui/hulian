import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
// dogfood 自家发给消费方的 dedupe 清单，避免两处漂移。
import { hulianDedupe } from "./vitest-preset.js";

/**
 * 两个 project，按「这条断言在 jsdom 里可不可信」分流：
 *
 * - **unit**（jsdom）—— props → DOM 契约、aria、受控/非受控、纯逻辑。快，绝大多数测试留在这。
 * - **browser**（真实 chromium）—— 拖拽、指针捕获、动画、布局/定位、滚动、WebGL、图表。
 *   这些在 jsdom 下的结论一律不可信：无布局引擎（坐标恒 0 / dragover 坐标 NaN）、
 *   无渲染循环（rAF 驱动的入场动画被饿死）、无合成器（WAAPI currentTime 冻结在 0）、
 *   无 GPU 上下文（WebGL 不可用），且 vitest.setup.ts 里的桩会把要测的行为本身屏蔽掉
 *   （PointerEvent 降级成 MouseEvent、setPointerCapture 变 no-op、IntersectionObserver 永不触发）。
 *
 * 分流靠文件名：`*.browser.test.tsx` 走真实浏览器，其余走 jsdom。
 * 现存测试无需改动，按需逐个迁移即可。
 *
 * 跑法：
 *   pnpm test                       # 两个 project 都跑
 *   pnpm vitest --project unit      # 只跑 jsdom
 *   pnpm vitest --project browser   # 只跑真实浏览器
 */
const BROWSER_TESTS = "src/**/*.browser.test.{ts,tsx}";

export default defineConfig({
  plugins: [react()],
  // browser project 走的是浏览器侧解析（不是 unit 那条 SSR 解析），`motion` 这类
  // 有多份入口的包会被解析出**第二份 React** —— 症状是 useState/useRef 读到 null，
  // 栈顶落在组件里，看着像组件坏了。dedupe 是唯一的根治手段。
  resolve: { dedupe: hulianDedupe },
  // 浏览器侧依赖预构建必须在**启动时**完成。否则某条测试第一次用到某个包（例如
  // handle 模式才渲染的 lucide 图标）会触发 Vite 中途重新优化 + reload，正在跑的
  // 用例被打断，报出来的却是 "Cannot read properties of null (reading 'useContext')"
  // 这种像 React 分裂的假象。把浏览器里会用到的重包一次性列全。
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-dev-runtime",
      "lucide-react",
      "motion",
      "motion/react",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@tanstack/react-virtual",
      "@base-ui/react/context-menu",
      "@base-ui/react/checkbox",
      "@base-ui/react/menu",
      "recharts",
      "class-variance-authority",
    ],
  },
  test: {
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          // 默认 5s 在**并发全量**下不够：单跑最慢的用例（DateTimePicker 一次要渲染
          // 日历 42 格 + 时/分共 84 个 option）约 1.4s，turbo 同时跑 7 个包时 CPU 争用
          // 让它涨到 5.4s 就偶发翻红 —— 红的是机器负载，不是组件。
          // 放宽不会掩盖真 bug：死循环/未 resolve 的 promise 照样超时，只是反馈慢一点。
          testTimeout: 15_000,
          include: ["src/**/*.test.{ts,tsx}"],
          // 显式列出默认 exclude —— 自定义 exclude 会整体替换默认值，漏写会把 node_modules 扫进来
          exclude: ["**/node_modules/**", "**/dist/**", BROWSER_TESTS],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: [BROWSER_TESTS],
          setupFiles: ["./vitest.setup.browser.ts"],
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
