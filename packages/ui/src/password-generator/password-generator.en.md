---
slug: password-generator
name: PasswordGenerator
category: forms
group: advanced
tags: []
exports:
  [
    PasswordGenerator,
    generatePassword,
    generatePassphrase,
    generateSecret,
    passwordEntropy,
    passphraseEntropy,
    strengthOf,
    randomInt,
    shuffle,
    resolvePasswordOptions,
    resolvePassphraseOptions,
    buildPools,
    PASSPHRASE_WORDLIST,
    CHARSET,
    AMBIGUOUS,
    LENGTH_RANGE,
    WORDS_RANGE,
    MIN_COUNT_RANGE,
    STRENGTH_THRESHOLDS,
  ]
status: enriched
---

# PasswordGenerator

> Secure password and passphrase generator with a built-in 1,747-word list, live entropy rating, copy and regenerate actions, localized UI, and reusable generation functions · cryptographic randomness with rejection sampling · hydration-safe SSR placeholder · forms/advanced

## When to use

Use PasswordGenerator to create new credentials during registration, password resets, API-key issuance, password-management flows, or bulk account creation. Use [SecretField](../secret-field/secret-field.md) to mask, reveal, and copy an existing secret, and [Input](../input/input.md) with `type="password"` to enter one; these components serve separate purposes.

It does not assess existing-password strength, generate usernames, or provision email forwarding. Existing-password assessment requires dictionary and pattern analysis from a tool such as zxcvbn; this component reports only the theoretical entropy of values it generates.

## Security guarantees

The security guarantees live in `core`, independently of the panel:

- **`crypto.getRandomValues` is the only random source.** `Math.random()` is predictable and unsuitable for credentials. Unsupported environments show an error and **never downgrade silently**.
- **Rejection sampling removes modulo bias.** A naive `bytes[i] % pool.length` makes early characters slightly more likely when the random range is not divisible by the pool size. Values in the uneven tail are discarded and redrawn.
- **The final result is shuffled.** Required category minima are filled first, then all characters are shuffled so positions do not reveal rules such as “uppercase first, lowercase second.”
- **Every enabled category is represented.** If digits or symbols are enabled, the result contains at least one, preventing generated values from failing their own policy.

Entropy is estimated as `length × log2(pool size)` for passwords and `word count × log2(word-list size)` for passphrases. This is an upper bound because constraints such as minimum digit and symbol counts slightly reduce the valid space—by less than one bit with the defaults.

## Import

```ts
import { PasswordGenerator } from "@hulianui/ui";
// Algorithms only, for servers, forms, or CLIs:
import { generatePassword, generatePassphrase, passwordEntropy } from "@hulianui/ui";
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| mode | `"password"｜"passphrase"` | — | Controlled mode; omit for internal state. |
| defaultMode | `"password"｜"passphrase"` | `"password"` | Initial mode when uncontrolled. |
| modes | `GeneratorMode[]` | Both modes | Allowed modes. Supplying one mode hides the top switcher. |
| defaultPasswordOptions | `PasswordOptions` | See below | Initial password-mode options. |
| defaultPassphraseOptions | `PassphraseOptions` | See below | Initial passphrase-mode options. |
| copyable | `boolean` | `true` | Whether to show the copy button. |
| showStrength | `boolean` | `true` | Whether to show the entropy value and strength meter. |
| showOptions | `boolean` | `true` | Whether to show the options panel. Set to `false` for a compact result-and-regenerate view, such as inside a popover. |
| labels | `Partial<PasswordGeneratorLabels>` | — | Per-label overrides with higher priority than the ConfigProvider locale. |
| className | `string` | — | Additional class name for the panel root. |

`PasswordOptions`: `length` defaults to 14 and is clamped to 5–128; `uppercase`, `lowercase`, `digits`, and `special` all default to `true`; `minDigits` and `minSpecial` default to 1 and are clamped to 1–9; `avoidAmbiguous` defaults to `false` and, when enabled, excludes `I l 1 O 0 o`.

`PassphraseOptions`: `words` defaults to 6 and is clamped to 3–20; `separator` defaults to `"-"`; `capitalize` and `includeNumber` default to `false`; `wordlist` defaults to the built-in 1,747-word list.

## Events

| Event | Type | Description |
|------|------|------|
| onGenerate | `(result: GeneratedSecret) => void` | Called for every generated value, including after the initial mount, with `{ value, mode, entropy, strength }`. |
| onModeChange | `(mode: GeneratorMode) => void` | Called when the mode changes; use to update controlled state. |
| onOptionsChange | `(state) => void` | Called when options change, for persisting preferences. |
| onCopy | `(value: string) => void` | Called after the component writes the value to the clipboard; use for feedback or audit hooks. |

## Slots

| Slot | Type | Description |
|------|------|------|
| actions | `ReactNode` | Additional actions rendered at the bottom, such as a “Use this password” button. |

## Example

```tsx
<PasswordGenerator onGenerate={(r) => setValue(r.value)} />
```

Enterprise policy preset: 16 characters, at least two digits and symbols, with ambiguous characters excluded:

```tsx
<PasswordGenerator
  modes={["password"]}
  defaultPasswordOptions={{ length: 16, minDigits: 2, minSpecial: 2, avoidAmbiguous: true }}
/>
```

A compact generator beside a password field; compose the Popover explicitly because the library does not add field-specific popup parts:

```tsx
<Popover>
  <PopoverTrigger render={<Button variant="outline" size="sm">Generate password</Button>} />
  <PopoverContent className="w-72 p-0">
    <PasswordGenerator modes={["password"]} showOptions={false} />
  </PopoverContent>
</Popover>
```

Replace the word list with an EFF list or a domain-specific vocabulary:

```tsx
<PasswordGenerator
  defaultMode="passphrase"
  defaultPassphraseOptions={{ words: 6, wordlist: myWordlist }}
/>
```

> Word-list entries should be unique. If duplicates exist, entropy uses the deduplicated list size so `passphraseEntropy` does not overstate strength.

## Pure-function usage

Use the algorithms without the panel in server code, form validation, or batch scripts:

```ts
import { generatePassword, generatePassphrase, passwordEntropy, strengthOf } from "@hulianui/ui";

const pw = generatePassword({ length: 20, avoidAmbiguous: true });
const bits = passwordEntropy({ length: 20, avoidAmbiguous: true }); // ≈ 119
strengthOf(bits); // "strong"

generatePassphrase({ words: 6, separator: "." });
```

Every generation function accepts an injectable `RandomInt` as its second argument. Tests can pass a deterministic source for reproducible output:

```ts
generatePassword({ length: 8 }, () => 0); // fixed sequence → fixed result
```

## Accessibility

- The result uses `<output aria-live="polite">`, so screen readers announce regenerated values.
- The strength bar uses `role="meter"`, `aria-valuenow` (0–4), and `aria-valuetext` (strength label), conveying strength without relying on color.
- All icon buttons, sliders, and numeric inputs have an `aria-label` from the current locale.

## i18n

Copy comes from `ConfigProvider` at `locale.passwordGenerator`, with built-in `zhCN` and `enUS` locales. Override individual strings with `labels`, which takes priority over the locale.

## Usage guidelines

- **SSR:** Generation is nondeterministic, so the first frame renders placeholder dots and the real value appears in an effect after mount. This avoids hydration mismatches but means the password is unavailable during the initial frame.
- **Changing any option regenerates the value.** This prevents the UI from showing an old password after its displayed policy changes. If options must change without regeneration, manage the generated value outside the component.
- The word list is approximately 16 KB uncompressed and is included only when this component is used.
