import { Fragment, jsxDEV as reactJsxDEV } from "react/jsx-dev-runtime";
import { translateFixtureProps } from "../fixture-copy";

export { Fragment };
export type { JSX } from "react/jsx-dev-runtime";

export const jsxDEV: typeof reactJsxDEV = (type, props, key, isStaticChildren, source, self) => {
  return reactJsxDEV(
    type,
    translateFixtureProps(props as Record<string, unknown>),
    key,
    isStaticChildren,
    source,
    self,
  );
};
