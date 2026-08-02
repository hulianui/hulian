import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { PasswordGenerator } from "../../../../packages/ui/src/password-generator/password-generator";
import type { GeneratorMode } from "../../../../packages/ui/src/password-generator/password-generator.types";
export const passwordGeneratorShowcase: ShowcaseSpec = {
    controls: [
        { prop: "defaultMode", type: "select", options: ["password", "passphrase"], defaultValue: "password", label: "Mode" },
        { prop: "showStrength", type: "boolean", defaultValue: true, label: "Show intensity bar" },
        { prop: "showOptions", type: "boolean", defaultValue: true, label: "Display parameter area" },
        { prop: "copyable", type: "boolean", defaultValue: true, label: "Can be copied" },
    ],
    examples: [
        {
            title: "Basic usage",
            description: "A 14-digit password is generated upon mounting. Any parameter changes will be recalculated immediately. The random number comes from crypto.getRandomValues with rejection sampling, not Math.random. The numbers in the result area are marked in blue and the symbols in red. It is only by hand-copying a long string that l and 1 can be distinguished.",
            code: `<PasswordGenerator />`,
            render: () => (<div className="max-w-sm">
          <PasswordGenerator />
        </div>),
        },
        {
            title: "Passphrase",
            description: "Randomly select words from the built-in 1747 word list to spell phrases - easy to remember, easy to pronounce, and easy to type on your mobile phone. Note that the number of words is the only strength variable: the phrase looks long, and 3 words are only 32 bit, and 6 words or more are enough.",
            code: `<PasswordGenerator
  defaultMode="passphrase"
  defaultPassphraseOptions={{ words: 6, separator: "-", capitalize: true }}
/>`,
            render: () => (<div className="max-w-sm">
          <PasswordGenerator defaultMode="passphrase" defaultPassphraseOptions={{ words: 6, separator: "-", capitalize: true }}/>
        </div>),
        },
        {
            title: "Enterprise Password Policy Default",
            description: "Write the company's password rules as default parameters: 16 digits, at least 2 numbers and 2 symbols, excluding similar characters (must be turned on when you want to read it orally to colleagues or copy it into the device by hand). Users can still adjust it on the panel, but the starting point is compliance.",
            code: `<PasswordGenerator
  modes={["password"]}
  defaultPasswordOptions={{
    length: 16,
    minDigits: 2,
    minSpecial: 2,
    avoidAmbiguous: true,
  }}
/>`,
            render: () => (<div className="max-w-sm">
          <PasswordGenerator modes={["password"]} defaultPasswordOptions={{ length: 16, minDigits: 2, minSpecial: 2, avoidAmbiguous: true }}/>
        </div>),
        },
        {
            title: "Lite version: insert elastic layer",
            description: "Turn off the parameter area and leave only \"result + change + copy\". After narrowing the width, it just hangs in Popover next to the password input box. The library does not create additional field components with elastic layers - just use the Popover + Button combination as needed.",
            code: `<Popover>
  <PopoverTrigger render={<Button variant="outline" size="sm">Generate password</Button>} />
  <PopoverContent className="w-72 p-0">
    <PasswordGenerator modes={["password"]} showOptions={false} />
  </PopoverContent>
</Popover>`,
            render: () => (<div className="w-72">
          <PasswordGenerator modes={["password"]} showOptions={false}/>
        </div>),
        },
        {
            title: "Catch result: actions slot",
            description: "The bottom action slot usually contains \"Use this password\" to write the current value back to the form. There are two ways to get the value: call onGenerate every time a new value comes out (including entropy and gear), or save a copy of state yourself and give it to the button in actions.",
            code: `const [value, setValue] = useState("");

<PasswordGenerator
  onGenerate={(r) => setValue(r.value)}
  actions={<Button size="sm" onClick={() => form.setFieldValue("password", value)}>Use this password</Button>}
/>`,
            render: () => (<div className="max-w-sm">
          <PasswordGenerator showOptions={false} actions={<Button size="sm" variant="outline">
                Use this password
              </Button>}/>
        </div>),
        },
        {
            title: "No intensity bar required",
            description: "showStrength=false Take away entropy and rating. It is suitable for scenarios where password rules have been displayed uniformly elsewhere on the page - but do not turn it off by default. Users rely on it to judge whether it is \"long enough\".",
            code: `<PasswordGenerator showStrength={false} modes={["password"]} />`,
            render: () => (<div className="max-w-sm">
          <PasswordGenerator showStrength={false} modes={["password"]}/>
        </div>),
        },
    ],
    states: [
        {
            name: "password",
            render: () => (<div className="max-w-sm">
          <PasswordGenerator modes={["password"]}/>
        </div>),
        },
        {
            name: "passphrase",
            render: () => (<div className="max-w-sm">
          <PasswordGenerator modes={["passphrase"]}/>
        </div>),
        },
        {
            name: "compact",
            render: () => (<div className="w-72">
          <PasswordGenerator modes={["password"]} showOptions={false}/>
        </div>),
        },
    ],
    renderWithProps: (props) => (<div className="max-w-sm">
      <PasswordGenerator defaultMode={(props.defaultMode as GeneratorMode) ?? "password"} showStrength={props.showStrength as boolean} showOptions={props.showOptions as boolean} copyable={props.copyable as boolean}/>
    </div>),
    toCode: (props) => {
        const attrs = [
            props.defaultMode && props.defaultMode !== "password"
                ? `defaultMode="${props.defaultMode}"`
                : "",
            props.showStrength === false ? "showStrength={false}" : "",
            props.showOptions === false ? "showOptions={false}" : "",
            props.copyable === false ? "copyable={false}" : "",
        ].filter(Boolean);
        return attrs.length ? `<PasswordGenerator
  ${attrs.join("\n  ")}
/>` : `<PasswordGenerator />`;
    },
};
