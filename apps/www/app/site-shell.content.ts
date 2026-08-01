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
  },
};

export default siteShellContent;
