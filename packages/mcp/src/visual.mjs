// 视觉锚点：让**没有眼睛的** agent 也能对特效件做出判断，并且能把判断转述给人确认。
//
// 起因（#140）：库里 380 件组件中 92 件是装饰件、151 件带 animated 标签，但 MCP 侧的通道是
// **不对称**的 —— 抑制侧一次按 category 拉黑 92 件（机器可判定），发掘侧只有 profile 里手写的
// 约 8 件。于是 agent 系统性地只用「安全」的功能件，做出来的页面对，但没有任何视觉记忆点。
//
// 更要命的是 agent 读到的只有「极光文字 · bg-clip 流动渐变 + chart token」这种实现描述，
// 它无从判断这在首屏是加分还是灾难。消费者是视觉动物而 agent 不是，这个落差必须由 MCP 补上，
// 而不是指望 agent 想象。本模块提供三样东西：
//
//   docsUrl —— 能甩给人看的链接，决策权回到视觉动物手里
//   motion  —— none/subtle/moderate/heavy，让 agent 能按 visualBudget 做**预算**而不是凭感觉
//   look    —— 一句人话的观感（动了什么 / 多强 / 该放哪 / 不该放哪）

/** 文档站基址。与 registry 同源，自建镜像时随 HULIAN_REGISTRY_URL 一起切。 */
const DOCS_BASE = (process.env.HULIAN_REGISTRY_URL || "https://hulianui.haloritual.com").replace(
  /\/+$/,
  "",
);

/**
 * 动效强度。**优先查表，查不到再按标签推**——
 * 推导只能给出「有没有动」，给不出「动得多厉害」，而 visualBudget 要的正是后者。
 * 所以凡是会被主动推荐的件都在 LOOK 里显式标了强度，推导只是兜底。
 */
const MOTION_BY_TAG = (tags) => {
  if (tags.includes("webgl")) return "heavy";
  if (tags.includes("animated")) return "moderate";
  return "none";
};

/**
 * 观感说明。**只写会被主动推荐的那批**（profile 的 preferEffects + overlay-fx 白名单）——
 * 给 380 件各编一句是编的，不是实测的；没有条目时宁可不给 look，也不给一句凭空想象的描述。
 *
 * 每条的写法固定为「动了什么 · 强度 · 该放哪 / 不该放哪」，因为 agent 需要的正是这三件事。
 */
const LOOK = {
  // ── 文字特效：强度取决于字数，用错地方（正文）是灾难 ──
  "aurora-text": {
    motion: "moderate",
    look: "标题级文字上流动的极光渐变。中等强度，只适合 1–6 个字的品牌词或首屏主标题；套到正文或长句上会变成一片晃动的彩色，读不下去。",
  },
  "sparkles-text": {
    motion: "moderate",
    look: "文字周围随机闪现的小星点。中等强度，用于首屏一个词的强调；同屏出现两处以上会显得廉价。",
  },
  "typing-animation": {
    motion: "moderate",
    look: "逐字打出的标题。中等强度，天然吸引视线也天然拖慢阅读，只放首屏第一句，不要放需要被反复阅读的内容。",
  },
  "word-rotate": {
    motion: "moderate",
    look: "一句话里某个词循环切换（「为 __ 而生」）。中等强度，适合讲清「服务多类人群」；切换项超过 4 个就读不完。",
  },
  "animated-shiny-text": {
    motion: "subtle",
    look: "文字上缓慢扫过的一道高光。低强度，适合次级标题或加载中的占位文案，不抢主标题。",
  },
  "number-ticker": {
    motion: "subtle",
    look: "数字从 0 滚动到目标值。低强度，关键指标出场时用；同屏多个会互相干扰，看板里只给最重要的 1–3 个。",
  },
  // ── 局部强调：中后台也能用的那一档 ──
  reveal: {
    motion: "subtle",
    look: "元素进入视口时的淡入上移。低强度，是**最安全**的一档动效：整页分节包一层即可，中后台的空态、结果页也适用。",
  },
  "border-beam": {
    motion: "subtle",
    look: "沿卡片边框跑一圈的光带。低强度且只占边缘，用来标「推荐方案」「当前生效」这类一处焦点；一屏两处以上就失去指示意义。",
  },
  "shine-border": {
    motion: "subtle",
    look: "卡片描边上缓慢流动的渐变。低强度，与 border-beam 二选一（同屏并用会打架），更适合静态强调而非「正在进行」。",
  },
  "card-spotlight": {
    motion: "subtle",
    look: "光标附近亮起的柔光，跟随指针。低强度，适合可点击卡片网格；触屏上无效果，别把它当唯一的可点击暗示。",
  },
  tilt: {
    motion: "subtle",
    look: "卡片随指针轻微 3D 倾斜。低强度，用于产品图 / 作品卡；表单与数据卡上会显得轻浮。",
  },
  "magic-card": {
    motion: "subtle",
    look: "卡片内跟随指针的渐变高光 + 描边。低强度，定价卡 / 特性卡的常用皮。",
  },
  "glass-surface": {
    motion: "none",
    look: "毛玻璃表面，本身不动。零动效，但要求身后有底图或渐变，压在纯色背景上看不出玻璃。",
  },
  // ── 按钮：主 CTA 一处就够 ──
  "shimmer-button": {
    motion: "moderate",
    look: "按钮边缘游走的微光火花。中等强度，整页只给**主 CTA** 一颗；表单里的提交按钮用它会像广告。",
  },
  "rainbow-button": {
    motion: "moderate",
    look: "流动彩虹底色 + 底部光晕。中等强度，比 ShimmerButton 更张扬，适合面向开发者的开源项目首屏。",
  },
  "pulsating-button": {
    motion: "moderate",
    look: "持续外扩的脉冲光环。中等强度且**永不停止**，只用于「限时 / 待处理」这类真的需要持续催促的动作，否则很快变噪音。",
  },
  "ripple-button": {
    motion: "subtle",
    look: "点击落点扩散的水波纹（Material 风）。低强度、只在点击时出现，是四个特效按钮里最克制的一档。",
  },
  // ── 结构性动效：中等强度但占面积 ──
  "animated-list": {
    motion: "subtle",
    look: "列表项逐条入场。低强度，用于实时消息 / 动态流；长列表用它会让首屏迟迟不稳定。",
  },
  marquee: {
    motion: "moderate",
    look: "横向无缝滚动的一排内容。中等强度，logo 墙 / 评价墙的标准形态；里面放需要读完的文字就等于不让人读。",
  },
  "bento-grid": {
    motion: "subtle",
    look: "大小不一的卡片网格（Apple 风）。低强度，是**排版**不是特效，用来在一屏里讲清 4–6 个卖点。",
  },
  "animated-beam": {
    motion: "moderate",
    look: "两点之间流动的连线光束。中等强度，用于画「A 连到 B」的架构图；节点超过 6 个会糊成一团。",
  },
  "orbiting-circles": {
    motion: "moderate",
    look: "围绕中心公转的一圈图标。中等强度，讲「生态 / 集成了哪些东西」；它一直在动，不要放在需要阅读的文字旁边。",
  },
  // ── 全屏背景：heavy，一页最多一处 ──
  aurora: {
    motion: "heavy",
    look: "全屏流动极光背景。高强度且占满视野，整页最多一处、只放首屏；移动端建议降级为静态渐变。",
  },
  particles: {
    motion: "heavy",
    look: "全屏漂浮粒子。高强度，持续占用 GPU，性能敏感场景与移动端应直接关闭。",
  },
  "dot-pattern": {
    motion: "none",
    look: "静态点阵底纹。零动效、极低成本，是「想要点质感又不能加动效」时的第一选择，中后台也安全。",
  },
  "grid-pattern": {
    motion: "none",
    look: "静态网格底纹。零动效，比点阵更「工程感」，适合开发者向产品的分节背景。",
  },
};

/** 组件文档页地址。slug 已在 registry，纯拼接，不查网。 */
export function docsUrl(slug) {
  return `${DOCS_BASE}/components/${slug}`;
}

/** 动效强度：none | subtle | moderate | heavy。 */
export function motionOf(item) {
  const slug = item?.name ?? "";
  if (LOOK[slug]) return LOOK[slug].motion;
  return MOTION_BY_TAG(item?.meta?.tags ?? []);
}

/** 一句人话的观感。没有实测过的件返回 null —— 不编。 */
export function lookOf(item) {
  return LOOK[item?.name ?? ""]?.look ?? null;
}

/** 是不是「视觉件」：带动效标签，或落在装饰分类里。 */
export function isVisualItem(item) {
  const tags = item?.meta?.tags ?? [];
  return tags.includes("animated") || tags.includes("webgl") || (item?.categories ?? []).includes("decoration");
}

/**
 * 给任意 registry item 附上视觉锚点。
 * docsUrl 对所有件都给（链接永远能甩给人看）；motion / look 只在有意义时给，
 * 免得给 Button 这类件挂一个 `motion: "none"` 的噪音字段。
 */
export function visualMeta(item) {
  const slug = item?.name ?? "";
  const out = { docsUrl: docsUrl(slug) };
  const motion = motionOf(item);
  if (motion !== "none" || LOOK[slug]) out.motion = motion;
  const look = lookOf(item);
  if (look) out.look = look;
  return out;
}

/** 只在文本行里追加真正有信息量的部分，别把每一行都撑长。 */
export function visualSuffix(item) {
  const look = lookOf(item);
  const motion = motionOf(item);
  if (look) return ` | 动效 ${motion} · ${look} | ${docsUrl(item.name)}`;
  if (motion !== "none") return ` | 动效 ${motion} | ${docsUrl(item.name)}`;
  return "";
}

/**
 * 按 surface 的 visualBudget 给出主动提醒。
 *
 * 与「机会点」的关键区别：机会点判的是**有场景没采用**（功能缺口），这里判的是
 * **该有记忆点却完全没有**（表达缺口）。后者永远是建议，不进门禁 —— 否则就撞回 #41
 * 的非目标「把库存结构问题算成采用失败，导出往中后台塞特效的结论」。
 *
 * @param surface   composeProfile 得到的 surface（带 visualBudget / preferEffects）
 * @param usedSlugs 项目已经用到的 slug 集合
 * @param slugMeta  slug → registry item
 * @param limit     最多给几条（admin-console 只给 1 条，见调用方）
 */
export function visualOpportunities({ surface, usedSlugs, slugMeta, limit = 3 }) {
  const budget = surface?.visualBudget;
  if (!budget) return [];
  const prefer = surface.preferEffects ?? [];
  if (!prefer.length) return [];

  // 已经有视觉表达了就不提醒 —— 提醒的意义是「一处都没有」，不是「不够多」。
  const alreadyVisual = [...usedSlugs].filter((slug) => {
    const item = slugMeta.get(slug);
    return item ? isVisualItem(item) : false;
  });
  if (alreadyVisual.length >= (budget.accent ?? 0)) return [];

  const out = [];
  for (const slot of budget.slots ?? []) {
    if (out.length >= limit) break;
    const candidates = prefer
      .filter((slug) => !usedSlugs.has(slug) && slugMeta.has(slug))
      .slice(0, 3);
    if (!candidates.length) break;
    const pick = candidates[out.length % candidates.length];
    const item = slugMeta.get(pick);
    out.push({
      slot,
      slug: pick,
      motion: motionOf(item),
      look: lookOf(item),
      docsUrl: docsUrl(pick),
      // 降级说明是必给的：agent 不会自己想到 reduced-motion 与移动端。
      fallback:
        motionOf(item) === "heavy"
          ? "移动端与 prefers-reduced-motion 下应关闭或换成静态渐变"
          : "prefers-reduced-motion 下组件自身会退化为静态，无需额外处理",
      note: `建议而非要求：${surface.id} 的视觉预算是 ${budget.heavy ?? 0} 处重物 + ${budget.accent ?? 0} 处强调。`,
    });
  }
  return out.slice(0, limit);
}
