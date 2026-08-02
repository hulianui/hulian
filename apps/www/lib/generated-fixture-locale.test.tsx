import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ConfigProvider, enUS } from "@hulianui/ui";
import { ChatPanelBlock } from "../app/blocks/_blocks/chat-panel.en";
import { ContactFormBlock } from "../app/blocks/_blocks/contact-form.en";
import { CartSummaryBlock } from "../app/blocks/_blocks/cart-summary.en";

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

function renderEnglish(ui: React.ReactNode) {
  return render(<ConfigProvider locale={enUS}>{ui}</ConfigProvider>);
}

function submitChatMessage(message: string) {
  vi.useFakeTimers();
  renderEnglish(<ChatPanelBlock />);
  fireEvent.change(screen.getByPlaceholderText("Send a message to Hulian Assistant..."), {
    target: { value: message },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
}

describe("generated English fixture modules", () => {
  it.each(["保存设置", "未登记中文用户输入"])(
    "preserves CJK user input verbatim: %s",
    (message) => {
      submitChatMessage(message);
      expect(screen.getByText(message)).toBeTruthy();
    },
  );

  it("renders idiomatic English contact validation", () => {
    renderEnglish(<ContactFormBlock />);
    fireEvent.click(screen.getByRole("button", { name: "Submit inquiry" }));

    expect(screen.getByText("Enter your name")).toBeTruthy();
    expect(screen.getByText("Enter your email address")).toBeTruthy();
    expect(screen.getByText("Select an inquiry type")).toBeTruthy();
    expect(screen.getByText("Briefly describe what you need")).toBeTruthy();
  });

  it("renders the cart confirmation entirely in English", () => {
    renderEnglish(<CartSummaryBlock />);
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(screen.getByText("Remove this item from your cart?")).toBeTruthy();
    const confirmation = within(screen.getByRole("dialog"));
    expect(confirmation.getByRole("button", { name: "Remove" })).toBeTruthy();
    expect(confirmation.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });
});
