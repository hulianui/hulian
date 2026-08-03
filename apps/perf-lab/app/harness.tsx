import { Component, type ErrorInfo, type ReactNode } from "react";
import type { Root } from "react-dom/client";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
  onMounted: () => void;
}

interface ErrorBoundaryState {
  error?: Error;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  // 整棵子树 commit 完才会走到这里，是「渲染真的结束了」唯一可靠的信号。
  // 挂在已经在树里的错误边界上，而不是插一个哨兵组件——后者会让 fiber 数 +1，
  // 直接污染 mountFanout / cascadeFanout 这些按 fiber 计数的指标。
  override componentDidMount(): void {
    this.props.onMounted();
  }

  override componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  override render(): ReactNode {
    return this.state.error ? null : this.props.children;
  }
}

export interface HarnessController {
  render(node: ReactNode): Promise<void>;
  clear(): Promise<void>;
  takeErrors(): string[];
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

export function createHarness(root: Root): HarnessController {
  let errors: string[] = [];
  let renderKey = 0;

  return {
    async render(node) {
      renderKey += 1;
      // 等两帧 rAF 不等于「渲染完成」：重组件在慢机器上一帧根本 commit 不完，
      // 溢出的渲染会被算进下一个 step 的窗口，看起来就像那一步产生了额外重渲染。
      // CPU 节流 x10 下 known-good fixture 因此被判出本不存在的重渲染（CI 上是 2 次）。
      // 先等 commit 落定，再等一次绘制让 passive effect 与帧指标收尾。
      await new Promise<void>((resolve) => {
        root.render(
          <ErrorBoundary
            key={renderKey}
            onError={(error) => errors.push(error.message)}
            onMounted={resolve}
          >
            {node}
          </ErrorBoundary>,
        );
      });
      await nextPaint();
    },
    async clear() {
      root.render(null);
      await nextPaint();
    },
    takeErrors() {
      const current = errors;
      errors = [];
      return current;
    },
  };
}
