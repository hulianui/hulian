import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CreditCard, detectBrand, formatCardNumber, maskCardNumber } from "./credit-card";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

describe("detectBrand", () => {
  it("visa ^4", () => expect(detectBrand("4111111111111111")).toBe("visa"));
  it("amex ^34/37", () => {
    expect(detectBrand("371449635398431")).toBe("amex");
    expect(detectBrand("341111111111111")).toBe("amex");
  });
  it("mastercard 51-55", () => expect(detectBrand("5500005555555559")).toBe("mastercard"));
  it("mastercard 2221-2720", () => expect(detectBrand("2221000000000009")).toBe("mastercard"));
  it("unionpay ^62", () => expect(detectBrand("6212345678901232")).toBe("unionpay"));
  it("jcb ^35", () => expect(detectBrand("3530111333300000")).toBe("jcb"));
  it("discover", () => expect(detectBrand("6011111111111117")).toBe("discover"));
  it("无法识别 → unknown", () => expect(detectBrand("9999")).toBe("unknown"));
  it("忽略空格", () => expect(detectBrand("4111 1111 1111 1111")).toBe("visa"));
});

describe("formatCardNumber", () => {
  it("普通卡 4-4-4-4", () => expect(formatCardNumber("4111111111111111")).toBe("4111 1111 1111 1111"));
  it("amex 4-6-5", () => expect(formatCardNumber("371449635398431")).toBe("3714 496353 98431"));
  it("不足分组照样输出余位", () => expect(formatCardNumber("411112")).toBe("4111 12"));
});

describe("maskCardNumber", () => {
  it("保留后 4 位、其余打码且保持分组", () => {
    expect(maskCardNumber("4111111111111111")).toBe("•••• •••• •••• 1111");
  });
  it("amex 分组下打码", () => {
    expect(maskCardNumber("371449635398431")).toBe("•••• •••••• •8431");
  });
  it("≤4 位不打码", () => expect(maskCardNumber("4111")).toBe("4111"));
});

describe("CreditCard 组件", () => {
  it("默认打码只露后 4 位 + 持卡人 + 有效期", () => {
    const { getByText, getByRole } = render(
      <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />,
    );
    expect(getByText("•••• •••• •••• 1111")).toBeTruthy();
    expect(getByText("ZHANG SAN")).toBeTruthy();
    expect(getByText("12/28")).toBeTruthy();
    expect(getByRole("img").getAttribute("aria-label")).toContain("1111");
    expect(getByText("持卡人")).toBeTruthy();
    expect(getByText("有效期")).toBeTruthy();
  });

  it("ConfigProvider locale=enUS renders English labels and accessible name", () => {
    const { getByText, getByRole } = render(
      <ConfigProvider locale={enUS}>
        <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />
      </ConfigProvider>,
    );
    expect(getByText("Cardholder")).toBeTruthy();
    expect(getByText("Expires")).toBeTruthy();
    expect(getByRole("img").getAttribute("aria-label")).toBe("VISA ending in 1111");
  });

  it("masked=false 显示完整卡号", () => {
    const { getByText } = render(<CreditCard number="4111111111111111" masked={false} />);
    expect(getByText("4111 1111 1111 1111")).toBeTruthy();
  });

  it("flipped 显示背面 CVC", () => {
    const { getByText } = render(<CreditCard number="4111111111111111" flipped cvc="123" />);
    expect(getByText("123")).toBeTruthy();
  });

  it("brand 显式覆盖识别", () => {
    const { getByLabelText } = render(<CreditCard number="0000" brand="mastercard" />);
    expect(getByLabelText("Mastercard")).toBeTruthy();
  });

  it("透传 className", () => {
    const { getByRole } = render(<CreditCard number="4111111111111111" className="my-card" />);
    expect(getByRole("img").classList.contains("my-card")).toBe(true);
  });
});
