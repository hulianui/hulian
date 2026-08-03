"use client";
import { Sun, SunDim } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ElasticSlider } from "../../../../packages/ui/src/elastic-slider/elastic-slider";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-40 w-full max-w-md items-center justify-center rounded-xl border border-border bg-surface p-8">
      {children}
    </div>);
}
export const elasticSliderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default volume slider, when dragged to both ends, the track will stretch and rebound like a rubber band.",
            code: `<ElasticSlider defaultValue={40} />`,
            render: () => (<Stage>
          <ElasticSlider defaultValue={40}/>
        </Stage>),
        },
        {
            title: "Custom icon",
            description: "Replace the icons at both ends with leftIcon / rightIcon, such as brightness adjustment.",
            code: `<ElasticSlider
  defaultValue={65}
  leftIcon={<SunDim className="size-5" aria-hidden />}
  rightIcon={<Sun className="size-5" aria-hidden />}
/>`,
            render: () => (<Stage>
          <ElasticSlider defaultValue={65} leftIcon={<SunDim className="size-5" aria-hidden/>} rightIcon={<Sun className="size-5" aria-hidden/>}/>
        </Stage>),
        },
        {
            title: "Step size adsorption",
            description: "After turning on isStepped, drag and press stepSize to round and adsorb.",
            code: `<ElasticSlider defaultValue={30} isStepped stepSize={10} />`,
            render: () => (<Stage>
          <ElasticSlider defaultValue={30} isStepped stepSize={10}/>
        </Stage>),
        },
        {
            title: "Customized range",
            description: "startingValue / maxValue sets the upper and lower bounds, and showValue can hide the value.",
            code: `<ElasticSlider
  defaultValue={0}
  startingValue={-50}
  maxValue={50}
  showValue={false}
/>`,
            render: () => (<Stage>
          <ElasticSlider defaultValue={0} startingValue={-50} maxValue={50} showValue={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "defaultValue", type: "number", defaultValue: 50, label: "Initial value" },
        { prop: "startingValue", type: "number", defaultValue: 0, label: "Nether" },
        { prop: "maxValue", type: "number", defaultValue: 100, label: "Upper bound" },
        { prop: "isStepped", type: "boolean", defaultValue: false, label: "Step size adsorption" },
        { prop: "stepSize", type: "number", defaultValue: 10, label: "Step size" },
        { prop: "showValue", type: "boolean", defaultValue: true, label: "Display value" },
    ],
    states: [
        {
            name: "default (Volume\u00B7Drag the rubber bands at both ends to stretch)",
            render: () => (<Stage>
          <ElasticSlider defaultValue={40}/>
        </Stage>),
        },
        {
            name: "Custom icon (brightness adjustment)",
            render: () => (<Stage>
          <ElasticSlider defaultValue={65} leftIcon={<SunDim className="size-5" aria-hidden/>} rightIcon={<Sun className="size-5" aria-hidden/>}/>
        </Stage>),
        },
        {
            name: "Step size adsorption (step 10)",
            render: () => (<Stage>
          <ElasticSlider defaultValue={30} isStepped stepSize={10}/>
        </Stage>),
        },
        {
            name: "Customized range (-50 ~ 50 \u00B7 Hidden value)",
            render: () => (<Stage>
          <ElasticSlider defaultValue={0} startingValue={-50} maxValue={50} showValue={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ElasticSlider defaultValue={p.defaultValue as number} startingValue={p.startingValue as number} maxValue={p.maxValue as number} isStepped={p.isStepped as boolean} stepSize={p.stepSize as number} showValue={p.showValue as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<ElasticSlider`,
        `  defaultValue={${p.defaultValue}}`,
        `  startingValue={${p.startingValue}}`,
        `  maxValue={${p.maxValue}}`,
        `  isStepped={${p.isStepped}}`,
        `  stepSize={${p.stepSize}}`,
        `  showValue={${p.showValue}}`,
        `/>`,
    ].join("\n"),
};
