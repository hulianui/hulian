import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";
import { translateFixtureValue } from "../fixture-copy";

export { Fragment };
export type { JSX } from "react/jsx-runtime";

export const jsx: typeof reactJsx = (type, props, key) =>
  reactJsx(type, translateFixtureValue(props) as Record<string, unknown>, key);
export const jsxs: typeof reactJsxs = (type, props, key) =>
  reactJsxs(type, translateFixtureValue(props) as Record<string, unknown>, key);
