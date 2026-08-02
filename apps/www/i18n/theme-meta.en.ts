export interface LocalizedThemeMeta {
  label: string;
  description: string;
}

export const themeMetaEn: Record<string, LocalizedThemeMeta> = {
  overview: { label: "Overview", description: "Token layers and consumption patterns." },
  color: { label: "Color", description: "Semantic colors, primitive palettes, and chart colors." },
  "dark-mode": {
    label: "Dark Mode",
    description: "Theme switching with data-theme and no visible flash.",
  },
  typography: {
    label: "Typography",
    description: "Type sizes, font weights, and line-height ratios.",
  },
  spacing: { label: "Spacing", description: "Spacing scale based on a 0.25rem unit." },
  breakpoints: { label: "Breakpoints", description: "Responsive breakpoints and usage guidance." },
  radius: { label: "Radius", description: "Base radius token and derived corner scales." },
  shadows: { label: "Shadows", description: "Elevation and shadow scales." },
  motion: { label: "Motion", description: "Easing, duration, and when motion is appropriate." },
  cursors: { label: "Cursors", description: "Pointer semantics for interactive states." },
};
