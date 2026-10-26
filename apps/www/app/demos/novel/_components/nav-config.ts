import { copy } from "./nav-config.content";

export const NOVEL_BASE = "/demos/novel";

export const brand = {
  name: copy("brand"),
  nameEn: "Ferry",
  slogan: copy("slogan"),
};

export const primaryNav = [
  { label: copy("library"), href: `${NOVEL_BASE}/library` },
  { label: copy("studio"), href: `${NOVEL_BASE}/studio` },
];
