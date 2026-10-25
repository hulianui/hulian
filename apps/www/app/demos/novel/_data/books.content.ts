import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    ferryTitle: "渡口的灯",
    ferryAuthor: "沈晚",
    ferryBlurb: "一盏灯，一段夜航。沈晚独自把盐和青菜送到对岸。",
    ferryC1Title: "夜航",
    ferryC1Body:
      "河面先暗下去。对岸的屋子还剩一格窗，沈晚把灯从空篮子里拿出来，挂到桅杆上。灯要比货高，这是父亲留下的规矩。\n\n船里没有客人。盐包压着两筐青菜，绳索绕了三圈。她解开缆，没有人送。\n\n到江心时雾起来了。她不回头。对岸那盏旧灯还在，守灯的人问盐够不够。她说够。\n\n她把灯吹灭，放回空篮子。明天还要回来。灯可以灭，路还在。",
    ferryC2Title: "返程",
    ferryC2Body:
      "回程的船轻了。盐和青菜都留在对岸，篮子里只剩灯。\n\n她在江心停了一停，把火重新点小一点，举高。雾还在，可对岸的窗已经全黑了。\n\n直到缆绳系回渡口，她才把灯吹灭。",
    ferryC3Title: "灯芯",
    ferryC3Body:
      "第二天傍晚，石阶上多了一根新灯芯，没有字条。\n\n沈晚把灯又挂上桅杆。这一次她回头看。江面上，渡口这盏灯最亮。",
    wellTitle: "井边的信",
    wellAuthor: "周柠",
    wellBlurb: "井台下压着一封没有署名的信。周柠读完，第二天把回信放回原处。",
    wellC1Title: "井台",
    wellC1Body:
      "天刚亮，井水还是平的。周柠去打水，看见石板下露出一角纸。她先把桶放下，才把信抽出来。\n\n信上只有一句：杏花今年还开吗。没有名字。\n\n她把水打满，把信叠好放进袖口。回家的路上，南边的杏树还是秃的。",
    wellC2Title: "回信",
    wellC2Body:
      "第二天她写了三行：开了。在树的南面。你若来看，水桶在原处。\n\n信仍压回石板下。再过一个早晨，石板是空的。杏花在南面开了几朵。她打满一桶水，没有再等。",
    southTitle: "南窗",
    southAuthor: "江禾",
    southBlurb: "雨打在南窗上。江禾把一壶茶喝到街上安静下来。",
    southC1Title: "雨",
    southC1Body:
      "雨先落在玻璃上，壶还没响。江禾把椅子挪近南窗，没有点灯。街上的颜色是雨自己的。\n\n她倒了第一杯。有人撑伞过去，伞沿碰到窗台，又很快走远。",
    southC2Title: "安静",
    southC2Body:
      "雨变小的时候，一辆车过去了，就没了声音。她把剩下的茶喝完，把窗留一条缝。房间还是暖的。明天这扇窗可以再打开。",
  },
  en: {
    ferryTitle: "The Ferry Light",
    ferryAuthor: "Shen Wan",
    ferryBlurb: "A lamp and a night crossing. Shen Wan ferries salt and greens to the far bank alone.",
    ferryC1Title: "Night crossing",
    ferryC1Body:
      "The river went dark first. One window was still lit on the far bank. Shen Wan took the lamp out of the empty basket and hung it on the mast. The lamp sits above the cargo. That was her father's rule.\n\nThere were no passengers. Sacks of salt pressed two baskets of greens, and the rope went around three times. She cast off. Nobody saw her off.\n\nFog rose at mid-river. She did not look back. The old lamp on the far bank was still burning. The keeper asked whether the salt was enough. She said yes.\n\nShe put the flame out and set the lamp back in the empty basket. Tomorrow she would return. The lamp can go out. The road remains.",
    ferryC2Title: "The way back",
    ferryC2Body:
      "The boat was lighter on the way back. The salt and the greens stayed on the far bank. Only the lamp was left in the basket.\n\nShe paused at mid-river, lit a smaller flame, and raised it. The fog was still there, but every window on the far bank had gone dark.\n\nShe did not put the lamp out until the rope was tied again at the ferry.",
    ferryC3Title: "The wick",
    ferryC3Body:
      "The next evening a new wick lay on the stone steps. There was no note.\n\nShen Wan hung the lamp on the mast again. This time she looked back. On the river, the ferry lamp was the brightest.",
    wellTitle: "The Well Letter",
    wellAuthor: "Zhou Ning",
    wellBlurb: "A letter with no name sat under the well stone. Zhou Ning read it and left an answer the next day.",
    wellC1Title: "The well",
    wellC1Body:
      "The well was still at dawn. Zhou Ning went for water and saw a corner of paper under the stone. She set the bucket down before she pulled the letter out.\n\nIt asked one thing: will the apricot bloom this year. There was no name.\n\nShe filled the bucket and folded the letter into her sleeve. On the way home the apricot tree to the south was still bare.",
    wellC2Title: "The reply",
    wellC2Body:
      "The next day she wrote three lines: It will. On the south side of the tree. If you come to look, the bucket is where it was.\n\nShe put the letter back under the stone. One morning later the stone was bare. A few apricot blossoms had opened on the south side. She filled a bucket and did not wait.",
    southTitle: "The South Window",
    southAuthor: "Jiang He",
    southBlurb: "Rain on the south window. Jiang He finishes a pot of tea as the street goes quiet.",
    southC1Title: "Rain",
    southC1Body:
      "Rain hit the glass before the kettle sang. Jiang He moved the chair closer to the south window and did not light the lamp. The street kept the color of the rain.\n\nShe poured the first cup. Someone passed with an umbrella, the edge touched the sill, and they were gone.",
    southC2Title: "The quiet",
    southC2Body:
      "When the rain thinned, a cart passed and the sound went with it. She finished the tea and left the window open a crack. The room stayed warm. Tomorrow the window can open again.",
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
