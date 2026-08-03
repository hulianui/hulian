import { type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: ["zh-CN", "en"],
    requiredLocales: ["zh-CN", "en"],
    defaultLocale: "zh-CN",
    strictMode: "strict",
  },
  routing: { enableProxy: false, storage: false },
  dictionary: { fill: false, importMode: "static" },
  content: { contentDir: ["app", "components", "lib", "i18n"] },
};

export default config;
