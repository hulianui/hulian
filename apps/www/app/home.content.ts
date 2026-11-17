import { t, type Dictionary } from "intlayer";

export const homeContent = {
  "zh-CN": {
    brand: "瑚琏",
    tagline: "颜值 + 好用，是软件的第一生产力。",
    taglineLead: "颜值 + 好用，是软件的",
    taglineAccent: "第一生产力",
    taglineTail: "。",
    origin: "名出《论语》宗庙之玉器——至贵至美，而确有大用。",
    copy: "复制",
    copied: "已复制",
  },
  en: {
    brand: "Hulian",
    tagline: "Beautiful and practical software makes every team more productive.",
    taglineLead: "Beautiful and practical software makes every team ",
    taglineAccent: "more productive",
    taglineTail: ".",
    origin: "Named for a precious ritual vessel: beautiful by design, useful by nature.",
    copy: "Copy",
    copied: "Copied",
  },
} as const;

const dictionary: Dictionary = {
  key: "home",
  content: t(homeContent),
};

export default dictionary;
