import type { Review } from "./types";

// 商品评价 mock：覆盖多评分（驱动评分分布 Meter）、追评、晒图。
export const reviews: Review[] = [
  { id: "r1", productId: "p-hs-air", author: "听风的人", rating: 5, date: "2026-06-02", spec: "曜石黑 · 降噪 Pro 版", content: "降噪是真的强，地铁里几乎听不到环境音，通勤戴一路很安静。续航也顶，一周充一次。", likes: 218, withImage: true },
  { id: "r2", productId: "p-hs-air", author: "M*****3", rating: 5, date: "2026-05-28", spec: "云母白 · 标准版", content: "颜值在线，白色很干净。双设备切换很丝滑，开会和听歌无缝切。", likes: 96 },
  { id: "r3", productId: "p-hs-air", author: "数码控老张", rating: 4, date: "2026-05-20", spec: "雾霾蓝 · 标准版", content: "整体满意，就是入耳偏紧，戴久了耳朵会有点胀，换了小号耳塞好多了。", likes: 41 },
  { id: "r4", productId: "p-hs-air", author: "匿名用户", rating: 5, date: "2026-05-15", spec: "曜石黑 · 标准版", content: "音质比上一代提升明显，低频更扎实。客服响应也快，好评。", likes: 33, withImage: true },
  { id: "r5", productId: "p-hs-air", author: "山***0", rating: 3, date: "2026-05-10", spec: "云母白 · 标准版", content: "降噪不错但触控有点灵敏，整理头发容易误触暂停。希望固件能优化。", likes: 12 },

  { id: "r6", productId: "p-hp-pro", author: "拍照爱好者", rating: 5, date: "2026-06-03", spec: "远峰蓝 · 16G+512G", content: "一英寸大底确实不一样，夜景纯净度很高，长焦拍演唱会也很清楚。", likes: 402, withImage: true },
  { id: "r7", productId: "p-hp-pro", author: "Z*****", rating: 5, date: "2026-05-30", spec: "暗夜黑 · 12G+256G", content: "钛金属手感高级，握持比想象轻。100W 快充半小时满电。", likes: 187 },
  { id: "r8", productId: "p-hp-pro", author: "果断剁手", rating: 4, date: "2026-05-26", spec: "晨曦金 · 16G+1T", content: "性能和影像都顶，唯一就是有点压手，喜欢轻薄的可能要适应。", likes: 64 },

  { id: "r9", productId: "p-hy-serum", author: "敏感肌自救", rating: 5, date: "2026-06-01", spec: "30ml 标准 · 单瓶", content: "用了一个月，痘印淡了不少，肤色均匀了。关键是敏感肌也不刺激。", likes: 521, withImage: true },
  { id: "r10", productId: "p-hy-serum", author: "成***分", rating: 5, date: "2026-05-22", spec: "50ml 大瓶 · 买一送一礼盒", content: "成分党认证，浓度够诚意，质地清爽好吸收，回购第三瓶了。", likes: 233 },
  { id: "r11", productId: "p-hy-serum", author: "路人甲", rating: 4, date: "2026-05-18", spec: "30ml 标准 · 单瓶", content: "效果温和需要坚持用，急效党可能觉得慢，但贵在稳定不翻车。", likes: 58 },

  { id: "r12", productId: "p-ho-shoe", author: "越野老炮", rating: 5, date: "2026-06-02", spec: "火山红 · 42", content: "深齿大底抓地很强，下雨天爬野山也不打滑。中底回弹长距离不累。", likes: 145, withImage: true },
  { id: "r13", productId: "p-ho-shoe", author: "跑***团", rating: 4, date: "2026-05-25", spec: "碳灰 · 41", content: "包裹很好，建议拍大半码。颜值也高，平时通勤也能穿。", likes: 67 },

  { id: "r14", productId: "p-hw-nuts", author: "养生少女", rating: 5, date: "2026-06-03", spec: "礼盒装 · 1050g", content: "每日一包很方便，坚果很新鲜不哈喇，配料干净。办公室常备。", likes: 301 },
  { id: "r15", productId: "p-hw-nuts", author: "K**8", rating: 5, date: "2026-05-29", spec: "30 包装 · 750g", content: "性价比高，独立包装不怕受潮。送长辈也体面。", likes: 88 },
];

export function reviewsOf(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}

/** 评分分布（5→1 星各占比），驱动评分分布 Meter。 */
export function ratingDistribution(productId: string): { star: number; count: number }[] {
  const rs = reviewsOf(productId);
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: rs.filter((r) => r.rating === star).length }));
}
