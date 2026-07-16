import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VoiceRecord } from "./voice-record";

describe("VoiceRecord", () => {
  it("renders idle state", () => {
    render(<VoiceRecord status="idle" />);
    expect(screen.getByLabelText("按住说话")).toBeInTheDocument();
    expect(screen.getByText("按住说话")).toBeInTheDocument();
  });

  it("renders recording state", () => {
    render(<VoiceRecord status="recording" />);
    expect(screen.getByLabelText("松开结束录音")).toBeInTheDocument();
    expect(screen.getByText("松开结束")).toBeInTheDocument();
  });

  it("renders processing state", () => {
    render(<VoiceRecord status="processing" />);
    expect(screen.getByLabelText("处理中")).toBeInTheDocument();
  });
});
