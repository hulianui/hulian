// 检索：把一句业务话变成 registry 里的候选积木。
//
// 为什么不能只用 `includes(query)`：AI 问的是「用户 管理 列表」这种任务级短语，
// 而 registry 里躺着的是「中后台列表页 · 页头 + 数据表格」。整句 substring 匹配返回 0，
// 于是模型得出「库里没有可复用的页面」——库里其实有 page-admin-list 和 block-data-table。
// 实测这一条假阴性把一次组件选型放大到 29 次 tool call。
//
// 这里做三件事：
//   1. 分词（中文按词 + 二元组切，拉丁按非字母数字切）
//   2. 中英同义扩展（registry 的 name/exports 是英文，问题多半是中文）
//   3. 多字段带权打分 + 覆盖度排序（命中几个词比命中得多深更重要）

/**
 * 中→英桥。registry 的 name/exports 全是英文 slug，而 AI 的 query 多半是中文；
 * 没有这张表，「弹窗」永远找不到 dialog。只收录本库真实存在的概念，不做泛化联想。
 */
const SYNONYMS = new Map(
  Object.entries({
    表格: ["table", "pro-table", "grid"],
    列表: ["list", "table"],
    数据表格: ["table", "pro-table"],
    表单: ["form", "field", "pro-form"],
    弹窗: ["dialog", "modal", "drawer"],
    对话框: ["dialog", "modal"],
    抽屉: ["drawer"],
    气泡确认: ["popconfirm"],
    确认: ["popconfirm", "confirm", "alert-dialog"],
    分页: ["pagination"],
    筛选: ["filter", "select", "cascader"],
    查询: ["search", "form", "filter"],
    搜索: ["search", "command", "combobox"],
    上传: ["upload"],
    下拉: ["select", "combobox", "listbox"],
    选择: ["select", "picker", "combobox"],
    日期: ["date-picker", "calendar", "date-range-picker"],
    时间: ["time-picker", "time-field"],
    图表: ["chart", "sparkline", "sankey", "funnel"],
    统计: ["stat", "statistic", "chart"],
    看板: ["kanban", "dashboard"],
    仪表盘: ["dashboard", "chart", "stat"],
    树: ["tree", "tree-select", "file-tree"],
    步骤: ["steps", "stepper", "steps-form"],
    标签页: ["tabs", "route-tabs"],
    标签: ["tag", "chip", "tabs"],
    导航: ["nav-menu", "navigation-menu", "navbar", "menu"],
    面包屑: ["breadcrumb"],
    侧栏: ["admin-layout", "layout", "nav-menu"],
    布局: ["layout", "admin-layout", "container", "grid"],
    骨架: ["skeleton", "layout"],
    提示: ["toast", "tooltip", "alert", "notification"],
    通知: ["notification", "toast"],
    头像: ["avatar"],
    按钮: ["button", "button-group", "fab"],
    开关: ["switch", "toggle"],
    滑块: ["slider", "elastic-slider"],
    进度: ["progress", "meter", "spin"],
    加载: ["spinner", "spin", "skeleton"],
    空状态: ["empty", "result"],
    登录: ["login-form", "page-login", "click-captcha"],
    注册: ["login-form"],
    验证码: ["click-captcha", "input-otp"],
    人机验证: ["click-captcha"],
    点选: ["click-captcha"],
    权限: ["access"],
    主题: ["theme"],
    国际化: ["config", "locale"],
    密码: ["password-generator", "field"],
    富文本: ["markdown-editor", "markdown"],
    编辑器: ["markdown-editor", "code-block", "editable-table"],
    代码: ["code", "code-block", "code-diff"],
    时间线: ["timeline"],
    轮播: ["carousel"],
    图片: ["image", "image-viewer", "image-cropper"],
    视频: ["video", "live-player"],
    聊天: ["chat-message", "conversation", "live-chat"],
    对话: ["conversation", "chat-message", "prompt-input"],
    价格: ["pricing-table"],
    定价: ["pricing-table"],
    批量: ["table", "pro-table", "transfer"],
    详情: ["descriptions", "document-sheet"],
    新增: ["form-dialog", "pro-form"],
    编辑: ["form-dialog", "editable-table", "pro-form"],
    删除: ["popconfirm", "alert-dialog"],
    用户: ["user", "avatar", "profile-card"],
    管理: ["admin", "admin-layout", "pro-table"],
    中后台: ["admin", "admin-layout", "pro-table"],
    后台: ["admin", "admin-layout"],
    移动端: ["tab-bar", "swipe-action", "pull-to-refresh", "action-sheet"],
    营销: ["marketing", "landing"],
    落地页: ["landing", "hero"],
  }),
);

const CJK = /[㐀-鿿぀-ヿ가-힯]/;
const isCjk = (value) => CJK.test(value);

/**
 * query → 加权 token。
 *
 * 每个 token 记着它来自查询里的哪个词（group）。覆盖度按 **group** 算而不是按 token 算：
 * 「弹窗」通过同义词命中 dialog、「用户管理」通过二元组命中「管理」，都应当算作那个词被覆盖了 ——
 * 否则中文查询永远是「部分匹配」，排序还对、结论却写着覆盖 0。
 */
export function tokenize(query) {
  const tokens = new Map();
  const groups = [];
  const add = (text, weight, group) => {
    if (!text) return;
    const key = `${group}::${text}`;
    const current = tokens.get(key);
    if (current) {
      current.weight = Math.max(current.weight, weight);
      return;
    }
    tokens.set(key, { text, weight, group });
  };

  for (const raw of String(query).split(/[\s,，、/|·]+/)) {
    const segment = raw.trim().toLowerCase();
    if (!segment) continue;
    if (isCjk(segment)) {
      groups.push(segment);
      add(segment, 1, segment);
      // 「用户管理列表」这种连写的长词，切二元组才能落到「管理」「列表」上
      if (segment.length > 2) {
        for (let index = 0; index + 2 <= segment.length; index += 1) {
          const bigram = segment.slice(index, index + 2);
          add(bigram, 0.5, segment);
          for (const synonym of SYNONYMS.get(bigram) ?? []) add(synonym, 0.4, segment);
        }
      }
      for (const synonym of SYNONYMS.get(segment) ?? []) add(synonym, 0.7, segment);
      continue;
    }
    for (const word of segment.split(/[^a-z0-9]+/)) {
      if (!word || word.length < 2) continue;
      groups.push(word);
      add(word, 1, word);
      for (const synonym of SYNONYMS.get(word) ?? []) add(synonym, 0.7, word);
    }
  }
  return { tokens: [...tokens.values()], groups: [...new Set(groups)] };
}

/** 一件积木上可被搜索的全部文本。#36 之前只有 name/title/description 三项。 */
export function searchableFields(item) {
  const meta = item.meta ?? {};
  return {
    name: item.name ?? "",
    title: item.title ?? "",
    description: item.description ?? "",
    exports: [...(meta.exports ?? []), ...(meta.types ?? [])].map((entry) =>
      String(entry).replace(/^type\s+/, ""),
    ),
    tags: meta.tags ?? [],
    group: meta.group ?? "",
    categories: item.categories ?? [],
  };
}

const includesToken = (haystack, token) => haystack.toLowerCase().includes(token);

/** 单个 token 在一件积木上的最好得分（取命中字段里最高的一档，不做累加，避免长描述刷分）。 */
function tokenScore(token, fields) {
  const slug = fields.name.toLowerCase();
  const slugParts = slug.split("-");
  let best = 0;
  const bid = (value) => {
    if (value > best) best = value;
  };

  if (slug === token) bid(10);
  else if (slugParts.includes(token)) bid(8);
  else if (includesToken(slug, token)) bid(6);

  if (fields.title.toLowerCase() === token) bid(9);
  else if (includesToken(fields.title, token)) bid(5);

  for (const symbol of fields.exports) {
    const value = symbol.toLowerCase();
    if (value === token) bid(7);
    else if (includesToken(value, token)) bid(3);
  }
  for (const tag of fields.tags) if (includesToken(String(tag), token)) bid(4);
  for (const category of fields.categories) if (includesToken(String(category), token)) bid(3);
  if (fields.group && includesToken(fields.group, token)) bid(3);
  if (includesToken(fields.description, token)) bid(3);

  return best;
}

/**
 * 打分排序。返回按 (覆盖度, 得分) 降序的候选，每条带 coverage/score，
 * 由调用方决定「确定命中」与「可能相关」的分界 —— 零结果时宁可给弱相关，也不谎报不存在。
 */
export function rank(items, query) {
  const { tokens, groups } = tokenize(query);
  if (!tokens.length) {
    return {
      tokens,
      primaryCount: 0,
      results: items.map((item) => ({ item, score: 0, coverage: 0, matched: [] })),
    };
  }
  const results = [];
  for (const item of items) {
    const fields = searchableFields(item);
    let score = 0;
    const matched = new Set();
    for (const token of tokens) {
      const hit = tokenScore(token.text, fields);
      if (hit <= 0) continue;
      score += hit * token.weight;
      matched.add(token.group);
    }
    if (score <= 0) continue;
    results.push({
      item,
      score: Number(score.toFixed(3)),
      coverage: matched.size,
      matched: [...matched],
    });
  }
  results.sort(
    (a, b) =>
      b.coverage - a.coverage ||
      b.score - a.score ||
      a.item.name.length - b.item.name.length ||
      a.item.name.localeCompare(b.item.name),
  );
  return { tokens, primaryCount: groups.length, results };
}
