import { t, type Dictionary } from "intlayer";

const siteShellContent: Dictionary = {
  key: "site-shell",
  content: {
    nav: {
      start: t({ "zh-CN": "开始", en: "Start" }),
      components: t({ "zh-CN": "组件", en: "Components" }),
      blocks: t({ "zh-CN": "区块", en: "Blocks" }),
      pages: t({ "zh-CN": "页面", en: "Pages" }),
      demos: t({ "zh-CN": "模版", en: "Demos" }),
      changelog: t({ "zh-CN": "更新", en: "Changelog" }),
    },
    brand: t({ "zh-CN": "瑚琏 Hulian", en: "Hulian UI" }),
    logoAlt: t({ "zh-CN": "瑚琏", en: "Hulian UI" }),
    currentVersion: t({
      "zh-CN": "当前版本 v{version}，查看更新日志",
      en: "Current version v{version}; view the changelog",
    }),
    github: t({ "zh-CN": "在 GitHub 上查看瑚琏源码", en: "View Hulian UI source on GitHub" }),
    themeNavigation: t({ "zh-CN": "主题导航", en: "Theme navigation" }),
    openMenu: t({ "zh-CN": "打开菜单", en: "Open menu" }),
    closeMenu: t({ "zh-CN": "关闭菜单", en: "Close menu" }),
    toggleTheme: t({ "zh-CN": "切换颜色主题", en: "Toggle color theme" }),
  },
};

export default siteShellContent;
