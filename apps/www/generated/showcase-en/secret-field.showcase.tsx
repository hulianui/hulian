"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SecretField } from "../../../../packages/ui/src/secret-field/secret-field";
import type { MaskStrategy } from "../../../../packages/ui/src/secret-field/secret-field.types";
const SAMPLE = "sk-hanhub-7f3a9c2e1b8d4056af12cd34ef56ab78";
export const secretFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default mask is sk-xxx...xxxx. Click on the eyes to reveal them and click on the copy to get the original value.",
            code: `<SecretField value="sk-hanhub-7f3a9c2e1b8d4056af12cd34ef56ab78" />`,
            render: () => <SecretField value={SAMPLE}/>,
        },
        {
            title: "Full mask",
            description: "maskStrategy=\"full\" is completely hidden and does not reveal the head and tail structure.",
            code: `<SecretField value={apiKey} maskStrategy="full" />`,
            render: () => <SecretField value={SAMPLE} maskStrategy="full"/>,
        },
        {
            title: "Read only and cannot be copied",
            description: "Remove the interactive stroke, hide the copy button, and purely display the scene.",
            code: `<SecretField value={apiKey} readOnly copyable={false} />`,
            render: () => <SecretField value={SAMPLE} readOnly copyable={false}/>,
        },
        {
            title: "Tail Action Slot",
            description: "actions slot has a revoke/reset button, side by side with display/copy.",
            code: `<SecretField
  value={apiKey}
  actions={
    <button type="button" className="px-1.5 text-xs text-danger">
      Revoked
    </button>
  }
/>`,
            render: () => (<SecretField value={SAMPLE} actions={<button type="button" className="px-1.5 text-xs text-danger">
              Revoked
            </button>}/>),
        },
        {
            title: "Size",
            description: "size=\"sm\" fits within dense table rows.",
            code: `<SecretField value={apiKey} size="sm" />`,
            render: () => <SecretField value={SAMPLE} size="sm"/>,
        },
    ],
    controls: [
        {
            prop: "maskStrategy",
            type: "select",
            options: ["prefix-suffix", "full"],
            defaultValue: "prefix-suffix",
            label: "Mask",
        },
        { prop: "copyable", type: "boolean", defaultValue: true, label: "Can be copied" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "Default mask", render: () => <SecretField value={SAMPLE}/> },
        { name: "Full mask", render: () => <SecretField value={SAMPLE} maskStrategy="full"/> },
        { name: "Controlled Apparition", render: () => <SecretField value={SAMPLE} revealed/> },
        { name: "Not to be copied", render: () => <SecretField value={SAMPLE} copyable={false}/> },
        { name: "sm", render: () => <SecretField value={SAMPLE} size="sm"/> },
    ],
    renderWithProps: (p) => (<SecretField value={SAMPLE} maskStrategy={p.maskStrategy as MaskStrategy} copyable={p.copyable as boolean} readOnly={p.readOnly as boolean}/>),
    toCode: (p) => `<SecretField value={apiKey} maskStrategy="${p.maskStrategy}"${p.copyable ? "" : " copyable={false}"}${p.readOnly ? " readOnly" : ""} />`,
};
