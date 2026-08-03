import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AppLauncher } from "../app-launcher/app-launcher";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { ColorField } from "../color-field/color-field";
import { ColorPicker } from "../colorpicker/color-picker";
import { CountrySelect } from "../country-select/country-select";
import { DateRangePicker } from "../date-range-picker/date-range-picker";
import { IconPicker } from "../icon-picker/icon-picker";
import { ImageCropper } from "../image-cropper/image-cropper";
import { ProfileCard } from "../profile-card/profile-card";
import { RegionCascader } from "../region-cascader/region-cascader";
import { ServiceMessage } from "../service-message/service-message";
import { ThreadList } from "../thread-list/thread-list";
import { VoiceRecord } from "../voice-record/voice-record";
import { ConfigProvider } from "./config-provider";
import { enUS } from "./locale";

afterEach(cleanup);

const renderEnglish = (node: React.ReactNode) =>
  render(<ConfigProvider locale={enUS}>{node}</ConfigProvider>);

describe("runtime locale coverage batch 2", () => {
  it("localizes picker and selector defaults", () => {
    const { getByLabelText, getByPlaceholderText, getByRole, getByText } = renderEnglish(
      <>
        <CountrySelect />
        <ColorPicker />
        <IconPicker
          defaultValue="star"
          recent={["star"]}
          sources={[{ key: "all", label: "All", icons: [{ name: "star" }], renderIcon: () => <span>*</span> }]}
        />
        <RegionCascader />
        <ColorField />
      </>,
    );

    expect(getByRole("group", { name: "Color format" })).toBeTruthy();
    expect(getByLabelText("Hex color value")).toBeTruthy();
    expect(getByPlaceholderText("Search icons")).toBeTruthy();
    expect(getByLabelText("Clear")).toBeTruthy();
    expect(getByLabelText("Open color picker")).toBeTruthy();
    expect(getByText("Select a country or region")).toBeTruthy();
    expect(getByText("Select province/city/district")).toBeTruthy();
  });

  it("localizes media and profile defaults", () => {
    const { getByLabelText, getByText } = renderEnglish(
      <>
        <ImageCropper image="data:image/png;base64," onCropped={() => {}} onCancel={() => {}} />
        <ProfileCard enableTilt={false} onContactClick={() => {}} />
        <VoiceRecord />
      </>,
    );

    expect(getByLabelText("Zoom")).toBeTruthy();
    expect(getByText("Confirm")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Frontend Engineer")).toBeTruthy();
    expect(getByLabelText("Contact Hulian")).toBeTruthy();
    expect(getByText("Hold to talk")).toBeTruthy();
  });

  it("localizes navigation and messaging defaults", () => {
    const { getByLabelText, getByText } = renderEnglish(
      <>
        <BubbleMenu logo={<span>Logo</span>} />
        <ServiceMessage source="System" onMore={() => {}} />
        <AppLauncher items={[]} categories={[{ key: "work", label: "Work" }]} />
        <ThreadList items={[{ id: "1", title: "Thread" }]} onDelete={() => {}} />
      </>,
    );

    expect(getByLabelText("Main navigation")).toBeTruthy();
    expect(getByLabelText("Toggle menu")).toBeTruthy();
    expect(getByLabelText("More")).toBeTruthy();
    expect(getByText("Open the mini app to view")).toBeTruthy();
    expect(getByLabelText("Search apps")).toBeTruthy();
    expect(getByLabelText("App categories")).toBeTruthy();
    expect(getByText("No matching apps")).toBeTruthy();
    expect(getByText("History")).toBeTruthy();
    expect(getByLabelText("Delete conversation")).toBeTruthy();
  });

  it("localizes date range defaults", () => {
    const { getByText, getByLabelText } = renderEnglish(<DateRangePicker presets />);
    fireEvent.click(getByText("Start date"));
    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Last 7 days")).toBeTruthy();
    expect(getByLabelText("Previous month")).toBeTruthy();
    expect(getByLabelText("Next month")).toBeTruthy();
  });
});
