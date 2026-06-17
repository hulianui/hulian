<!-- 中文见 [README.md](README.md) -->

# Hulian (瑚琏)

A **publishable React design system** (`@hulianui/ui`) — 349 components built on an OKLCH two-layer token system and Tailwind v4, with zero-flash light/dark switching and runtime theming — plus a full **showcase docs site** (real sample data / all states / MSW-mocked APIs / tweakable playground).

> 🌐 Docs: **[hulianui.haloritual.com](https://hulianui.haloritual.com)** · 🇨🇳 China mirror: [hulianui-zh.haloritual.com](https://hulianui-zh.haloritual.com)

## Tech foundation

- **React 18/19** + **TypeScript**
- **Tailwind v4** (`@theme inline` + preset)
- **Base UI** for headless primitives (accessibility / behavior), Tailwind for skinning
- **OKLCH** two-layer tokens (primitive → semantic), theme-aware shadows & hairlines
- Ships **source** (`src/`), not a compiled `dist` — consumers transpile TSX (Next / Vite ready)

## Quick start

> `@hulianui/*` is currently published to a **GitHub Packages registry** (org `hulianui`). GitHub Packages requires a token even for public packages, so consumers must configure a registry + auth first.

**0. Configure registry + auth** — create a PAT with `read:packages`, then in your project root `.npmrc`:

```ini
@hulianui:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```bash
export GITHUB_TOKEN=ghp_xxxxx
```

**1. Install**

```bash
pnpm add @hulianui/ui @hulianui/tokens
# peers: react, react-dom, tailwindcss, @base-ui-components/react, motion
```

**2. Wire up tokens + preset, and add the library source to Tailwind's scan**

```css
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";
```

**3. Use components inside a `ThemeProvider`**

```tsx
import { ThemeProvider, Button } from "@hulianui/ui";

<ThemeProvider defaultSetting="system">
  <Button>Hulian</Button>
</ThemeProvider>;
```

> The anti-flash inline script is injected by each app's entry (see `apps/www/app/theme-script.tsx`), not bundled into the library.

## Status

- 📦 **Published to GitHub Packages**: `@hulianui/ui` + `@hulianui/tokens` (changesets-managed, auto-published via GitHub Actions with the built-in `GITHUB_TOKEN`)
- 🧩 **349 components**: controls / forms / data display / feedback / navigation / overlay / charts / effect backgrounds / AI agent / live streaming / node canvas …
- 🏗️ **18 built-in demos**, all dogfooding the library
- ✅ **Three-gate CI green**: typecheck + 2705 vitest tests (367 files) + static export of the docs site
- 🎨 OKLCH two-layer tokens + Tailwind v4 preset + zero-flash dark mode + runtime theming

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Please also read the [Code of Conduct](CODE_OF_CONDUCT.md) and report security issues per [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © hulianui
