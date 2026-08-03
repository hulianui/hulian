import { Component, type ErrorInfo, type ReactNode } from "react";
import type { Root } from "react-dom/client";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError: (error: Error) => void;
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
      root.render(
        <ErrorBoundary
          key={renderKey}
          onError={(error) => errors.push(error.message)}
        >
          {node}
        </ErrorBoundary>,
      );
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
