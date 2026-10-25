import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    title: "渡口的灯",
    author: "沈晚",
    blurb: "一盏灯，一段夜航。沈晚独自把盐和青菜送到对岸。",
    c1Title: "夜航",
    c1Body:
      "河面先暗下去。对岸的屋子还剩一格窗，沈晚把灯从空篮子里拿出来，挂到桅杆上。灯要比货高，这是父亲留下的规矩。\n\n船里没有客人。盐包压着两筐青菜，绳索绕了三圈。她解开缆，没有人送。\n\n到江心时雾起来了。她不回头。对岸那盏旧灯还在，守灯的人问盐够不够。她说够。\n\n她把灯吹灭，放回空篮子。明天还要回来。灯可以灭，路还在。",
    c2Title: "返程",
    c2Body:
      "回程的船轻了。盐和青菜都留在对岸，篮子里只剩灯。\n\n她在江心停了一停，把火重新点小一点，举高。雾还在，可对岸的窗已经全黑了。\n\n直到缆绳系回渡口，她才把灯吹灭。",
    c3Title: "灯芯",
    c3Body:
      "第二天傍晚，石阶上多了一根新灯芯，没有字条。\n\n沈晚把灯又挂上桅杆。这一次她回头看。江面上，渡口这盏灯最亮。",
  },
  en: {
    title: "The Ferry Light",
    author: "Shen Wan",
    blurb: "A lamp and a night crossing. Shen Wan ferries salt and greens to the far bank alone.",
    c1Title: "Night crossing",
    c1Body:
      "The river went dark first. One window was still lit on the far bank. Shen Wan took the lamp out of the empty basket and hung it on the mast. The lamp sits above the cargo. That was her father's rule.\n\nThere were no passengers. Sacks of salt pressed two baskets of greens, and the rope went around three times. She cast off. Nobody saw her off.\n\nFog rose at mid-river. She did not look back. The old lamp on the far bank was still burning. The keeper asked whether the salt was enough. She said yes.\n\nShe put the flame out and set the lamp back in the empty basket. Tomorrow she would return. The lamp can go out. The road remains.",
    c2Title: "The way back",
    c2Body:
      "The boat was lighter on the way back. The salt and the greens stayed on the far bank. Only the lamp was left in the basket.\n\nShe paused at mid-river, lit a smaller flame, and raised it. The fog was still there, but every window on the far bank had gone dark.\n\nShe did not put the lamp out until the rope was tied again at the ferry.",
    c3Title: "The wick",
    c3Body:
      "The next evening a new wick lay on the stone steps. There was no note.\n\nShen Wan hung the lamp on the mast again. This time she looked back. On the river, the ferry lamp was the brightest.",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-novel-data-books",
  content: t(content),
};

export default dictionary;
