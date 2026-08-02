import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";

export { Fragment };
export type { JSX } from "react/jsx-runtime";

export const jsx: typeof reactJsx = (type, props, key) =>
  reactJsx(type, props, key);
export const jsxs: typeof reactJsxs = (type, props, key) =>
  reactJsxs(type, props, key);
