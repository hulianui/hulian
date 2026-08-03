import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SecretField, maskSecret } from "./secret-field";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("maskSecret", () => {
  it("prefix-suffix 保留首尾", () => {
    expect(maskSecret("sk-abcdefgh1234wxyz", "prefix-suffix")).toBe("sk-abc…wxyz");
  });
  it("full 全掩", () => {
    expect(maskSecret("sk-abc", "full")).toMatch(/^•+$/);
  });
  it("短串退化全掩", () => {
    expect(maskSecret("sk-1", "prefix-suffix")).toMatch(/^•+$/);
  });
});

describe("SecretField", () => {
  it("默认掩码，不直接暴露原值", () => {
    const { queryByText } = render(<SecretField value="sk-abcdefgh1234wxyz" />);
    expect(queryByText("sk-abcdefgh1234wxyz")).toBeNull();
  });
  it("点眼睛显形原值", () => {
    const { getByLabelText, getByText } = render(<SecretField value="sk-abcdefgh1234wxyz" />);
    fireEvent.click(getByLabelText("显示"));
    expect(getByText("sk-abcdefgh1234wxyz")).toBeTruthy();
  });
  it("复制回调拿到原值", () => {
    const onCopy = vi.fn();
    const { getByLabelText } = render(<SecretField value="sk-xyz" onCopy={onCopy} />);
    fireEvent.click(getByLabelText("复制"));
    expect(onCopy).toHaveBeenCalledWith("sk-xyz");
  });
  it("受控 revealed 直接显形", () => {
    const { getByText } = render(<SecretField value="sk-controlled-1234" revealed />);
    expect(getByText("sk-controlled-1234")).toBeTruthy();
  });
  it("copyable=false 不渲染复制钮", () => {
    const { queryByLabelText } = render(<SecretField value="sk-xyz" copyable={false} />);
    expect(queryByLabelText("复制")).toBeNull();
  });
  it("动作标签跟随 ConfigProvider", () => {
    const { getByLabelText } = render(<ConfigProvider locale={enUS}><SecretField value="sk-xyz" /></ConfigProvider>);
    expect(getByLabelText("Show")).toBeTruthy();
    expect(getByLabelText("Copy")).toBeTruthy();
  });
});
