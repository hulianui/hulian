import type { LiveProduct, Streamer } from "./types";

export const STREAMER: Streamer = {
  name: "瀚选优品 · 主播阿楠",
  fans: "28.6w",
  meta: "粉丝 28.6w · 直播 326 场",
};

/** 弹幕 / 公屏文案池。 */
export const DANMAKU_POOL = [
  "主播好飒！",
  "这件外套有大码吗",
  "求 3 号链接",
  "价格还能再低点不",
  "已拍下，等发货~",
  "面料是纯棉的吗",
  "新人第一次进直播间",
  "灯牌应援 🔆",
  "前排围观",
  "主播声音真好听",
  "这个真的划算",
  "蹲一个上身效果",
  "包邮吗包邮吗",
  "买过，质量很好",
  "什么时候发货呀",
  "颜色有几种",
  "已三连 ❤️",
  "求个优惠券",
  "讲讲保温杯那个",
  "下单了下单了",
];

/** 提问类弹幕（触发 AI 答弹幕草稿）。 */
export const QUESTION_POOL = [
  "这件有 XL 码吗？",
  "保温杯能装多少毫升？",
  "耳机续航多久？",
  "氛围灯能调色吗？",
  "外套掉毛吗？",
  "什么时候发货？",
  "支持七天无理由吗？",
];

export const VIEWER_NAMES = [
  "阿白", "momo", "夜航船", "小鹿", "Kris", "豆豆龙", "山雀", "海风", "阿楠的粉",
  "可乐不加冰", "晚风", "向日葵", "老顾客张姐", "数码控", "省钱小能手", "西西",
  "土豪哥", "甜筒", "栗子", "阿洲",
];

export const GIFTS = [
  { name: "小心心", icon: "💖", color: "var(--color-chart-1)" },
  { name: "棒棒糖", icon: "🍭", color: "var(--color-chart-3)" },
  { name: "火箭", icon: "🚀", color: "var(--color-chart-2)" },
  { name: "跑车", icon: "🏎️", color: "var(--color-chart-4)" },
  { name: "城堡", icon: "🏰", color: "var(--color-chart-1)" },
];

/** 互动栏可送礼物（C 端面板）。 */
export const GIFT_PANEL = GIFTS.map((g, i) => ({ ...g, coins: [1, 9, 66, 188, 520][i] }));

/** 本地内联渐变图（零外链，过门禁）。 */
export function productImage(hue: number): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 62% 68%)"/><stop offset="1" stop-color="hsl(${hue + 38} 58% 50%)"/></linearGradient></defs><rect width="160" height="160" fill="url(#g)"/></svg>`,
  )}`;
}

export const PRODUCTS: LiveProduct[] = [
  { id: "p1", index: 1, title: "冬季加厚羊羔绒外套 男女同款 直播专享价", image: productImage(18), price: 129, originalPrice: 399, stock: 86, sold: 1240, tag: "秒杀", explaining: true },
  { id: "p2", index: 2, title: "316 不锈钢便携保温杯 500ml 长效保温", image: productImage(200), price: 49.9, originalPrice: 99, stock: 320, sold: 3580 },
  { id: "p3", index: 3, title: "主动降噪无线蓝牙耳机 30h 续航", image: productImage(140), price: 199, originalPrice: 499, stock: 58, sold: 920, tag: "限量" },
  { id: "p4", index: 4, title: "桌面 RGB 智能氛围灯 APP 调色", image: productImage(280), price: 69, originalPrice: 159, stock: 210, sold: 460 },
  { id: "p5", index: 5, title: "纯棉抗菌四件套 裸睡级亲肤 1.8m 床", image: productImage(96), price: 159, originalPrice: 359, stock: 140, sold: 1760 },
  { id: "p6", index: 6, title: "护眼台灯 国 AA 级 无频闪 三色温", image: productImage(46), price: 89, originalPrice: 219, stock: 96, sold: 640 },
];

/** AI 答弹幕草稿模板（按问题关键词命中）。 */
export const AI_REPLIES: { match: RegExp; reply: string }[] = [
  { match: /码|大小|XL|尺/, reply: "亲，这款有 S–XXL 全码段，1 号链接详情页有尺码表，按平时码拍就好~" },
  { match: /保温|毫升|ml|容量/, reply: "2 号保温杯净容量 500ml，316 食品级内胆，6 小时仍有 58℃ 哦。" },
  { match: /续航|耳机|降噪/, reply: "3 号耳机单次 8 小时、配充电仓共 30 小时，主动降噪 -42dB。" },
  { match: /灯|调色|氛围/, reply: "4 号氛围灯支持 APP 1600 万色 + 音乐律动，今晚下单送遥控。" },
  { match: /发货|什么时候/, reply: "今晚下单 48 小时内发货，江浙沪次日达，偏远地区顺延~" },
  { match: /无理由|退|换/, reply: "全店支持七天无理由退换，运费险已赠，放心拍~" },
];

export const DEFAULT_REPLY = "这位宝宝的问题我看到啦，稍等主播口播解答一下哈~";

/** AI 提词 / 运营提醒池。 */
export const AI_TIPS = [
  "在线人数回升，建议现在抛出 1 号外套的限时叠加券承接流量。",
  "弹幕里「发货」提问变多，口播一次发货时效可降低疑虑。",
  "3 号耳机停留时长高但转化低，建议补一句续航对比竞品。",
  "互动率走低，发起一次「扣 1 抽免单」可拉回停留。",
  "新观众占比 41%，建议重复一次福袋玩法规则。",
];

export const AI_ACTIONS = [
  { tool: "上架 1 号链接", text: "已把「羊羔绒外套」置为讲解中并弹出小黄车。" },
  { tool: "发放 3 折券", text: "已对在线观众发放 100 张 3 折秒杀券，有效期 10 分钟。" },
  { tool: "置顶高赞提问", text: "已把「有大码吗」置顶到公屏，方便统一解答。" },
  { tool: "开启福袋", text: "已开启「关注抽免单」福袋，60 秒后开奖。" },
];
