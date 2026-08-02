"use client";

export * from "@hulianui/ui";

import { toast as baseToast } from "@hulianui/ui";
import { translateFixtureProps } from "./fixture-copy";

export const toast: typeof baseToast = (options) =>
  baseToast(translateFixtureProps(options as Record<string, unknown>) as Parameters<typeof baseToast>[0]);
