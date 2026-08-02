"use client";

export * from "@hulianui/ui";

import { toast as baseToast } from "@hulianui/ui";
import { translateFixtureValue } from "./fixture-copy";

export const toast: typeof baseToast = (options) =>
  baseToast(translateFixtureValue(options) as Parameters<typeof baseToast>[0]);
