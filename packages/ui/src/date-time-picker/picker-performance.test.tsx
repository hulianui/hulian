import type { ReactElement } from "react";
import { describe, it } from "vitest";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";
import { DatePicker } from "../date-picker/date-picker";
import { TimePicker } from "../time-picker/time-picker";
import { DateTimePicker } from "./date-time-picker";

// 守护的东西只有一条：父级更新时这三个 picker 必须跳过自己的子树。
// 判据（结构断言 + 现场测出的分母）已统一进 test/memo-guard.tsx，见那里的说明；
// 这个文件早先自带的两层判据就是它的原型（hulianui/hulian#106）。
const cases: Array<[string, () => ReactElement]> = [
  ["DatePicker", () => <DatePicker aria-label="选择日期" />],
  ["TimePicker", () => <TimePicker aria-label="选择时间" />],
  ["DateTimePicker", () => <DateTimePicker aria-label="选择日期时间" />],
];


describe("picker stable parent updates", () => {
  it.each(cases)("%s skips its subtree", async (_name, renderPicker) => {
    await expectMemoSkipsSubtree(renderPicker);
  });
});
