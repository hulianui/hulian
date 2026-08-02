import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    neonMechanicalCat: "霓虹机械猫",
    vincentHighDefinitionEnlargement: "文生图 · 高清放大",
    minutesAgo: "2 分钟前",
    aMechanicalCatSittingInANeonAlleyRainyNight: "一只机械猫坐在霓虹小巷，雨夜，电影感光影",
    morningFogMountainLake: "晨雾山湖",
    vincentMapsFoundation: "文生图 · 基础",
    minutesAgoAlternate: "11 分钟前",
    mountainLakesInTheMorningMistRealisticScenerySoftMorning:
      "晨雾中的山间湖泊，写实风光，柔和晨光",
    starryWhale: "星空鲸鱼",
    vincentVideo: "文生视频",
    minutesAgoSecondary: "26 分钟前",
    whalesRoamingTheStarsDreamySlowShot: "鲸鱼在星空中游弋，梦幻，慢镜头",
    futureSkyline: "未来天际线",
    minutesAgoTertiary: "32 分钟前",
    futureCitySkylineDuskUltraWideAnglePoster: "未来城市天际线，黄昏，超广角，海报",
    watercolorGirl: "水彩少女",
    tuscanyStyleRedraw: "图生图 · 风格重绘",
    minutesAgoQuaternary: "48 分钟前",
    retainCompositionAndTurnToWatercolorIllustrationStyle: "保留构图，转为水彩插画风",
    nationalStyleCourtyard: "国风庭院",
    hourAgo: "1 小时前",
    gangnamCourtyardInkCountryStyleFlyingCorner: "江南庭院，水墨国风，飞檐翘角",
    cyberStreetMarket: "赛博街市",
    cyberpunkNightMarketRainNeonSignsVerticalComposition: "赛博朋克夜市，雨，霓虹招牌，竖构图",
    mobileGalaxy: "流动星河",
    tucsonVideo: "图生视频",
    hoursAgo: "2 小时前",
    uploadAPictureToGetItUpAndRunning: "上传一张图，直接让它动起来",
    minimalistProductDiagram: "极简产品图",
    hoursAgoAlternate: "3 小时前",
    minimalistWhiteProductPhotographySoftLightHighTexture: "极简白底产品摄影，柔光，高质感",
    filmPortrait: "胶片人像",
    yesterday: "昨天",
    filmGrainPortraitWarmthShallowDepthOfField: "胶片颗粒人像，暖调，浅景深",
    threeDimensionalCartoonHouse: "3D 卡通屋",
    threeDimensionalCartoonCabinPrompt: "3D 渲染卡通小屋，糖果色，柔和阴影",
    neonWhaleFalls: "霓虹鲸落",
  },
  en: {
    neonMechanicalCat: "Neon mechanical cat",
    vincentHighDefinitionEnlargement: "Text to Image · HD Upscale",
    minutesAgo: "2 minutes ago",
    aMechanicalCatSittingInANeonAlleyRainyNight:
      "A mechanical cat in a neon-lit alley on a rainy night, cinematic photography",
    morningFogMountainLake: "Mountain lake at dawn",
    vincentMapsFoundation: "Text to Image · Basic",
    minutesAgoAlternate: "11 minutes ago",
    mountainLakesInTheMorningMistRealisticScenerySoftMorning:
      "A mountain lake in morning mist, photorealistic landscape, soft dawn light",
    starryWhale: "Whale among the stars",
    vincentVideo: "Text to Video",
    minutesAgoSecondary: "26 minutes ago",
    whalesRoamingTheStarsDreamySlowShot:
      "A whale drifting through a star field, dreamlike, slow camera movement",
    futureSkyline: "Future skyline",
    minutesAgoTertiary: "32 minutes ago",
    futureCitySkylineDuskUltraWideAnglePoster:
      "Futuristic city skyline at dusk, ultra-wide composition, poster design",
    watercolorGirl: "Watercolor portrait",
    tuscanyStyleRedraw: "Image to Image · Style transfer",
    minutesAgoQuaternary: "48 minutes ago",
    retainCompositionAndTurnToWatercolorIllustrationStyle:
      "Keep the composition and restyle it as a watercolor illustration",
    nationalStyleCourtyard: "Traditional courtyard",
    hourAgo: "1 hour ago",
    gangnamCourtyardInkCountryStyleFlyingCorner:
      "Jiangnan courtyard, Chinese ink style, upturned eaves",
    cyberStreetMarket: "Cyberpunk street market",
    cyberpunkNightMarketRainNeonSignsVerticalComposition:
      "Cyberpunk night market in the rain, neon signs, vertical composition",
    mobileGalaxy: "Galaxy in motion",
    tucsonVideo: "Image to Video",
    hoursAgo: "2 hours ago",
    uploadAPictureToGetItUpAndRunning: "Upload an image and bring it to life",
    minimalistProductDiagram: "Minimalist product shot",
    hoursAgoAlternate: "3 hours ago",
    minimalistWhiteProductPhotographySoftLightHighTexture:
      "Minimalist product photography on white, soft lighting, rich texture",
    filmPortrait: "Film portrait",
    yesterday: "Yesterday",
    filmGrainPortraitWarmthShallowDepthOfField:
      "Film grain portrait, warmth, shallow depth of field",
    threeDimensionalCartoonHouse: "3D cartoon house",
    threeDimensionalCartoonCabinPrompt: "3D cartoon cabin, candy colors, soft shadows",
    neonWhaleFalls: "Neon whale fall",
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>(
    (text, value, index) => text.replaceAll(`{${index}}`, String(value)),
    content[DOCS_LOCALE][key],
  );
}

const dictionary: Dictionary = {
  key: "demo-ai-workflow-data-artifacts",
  content: t(content),
};

export default dictionary;
