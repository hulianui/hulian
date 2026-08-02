"use client";
import { createContext, useContext } from "react";

/**
 * 组件内置文案的 i18n 字典。当前覆盖企业层 ProTable / AdminLayout 的可见文案；
 * 后续组件接入 i18n 时在此扩展（原子件文案为渐进迁移项，见 docs/enterprise-roadmap.md）。
 */
export interface Locale {
  /** Shared copy for lower-level interactive components. Optional for backwards compatibility. */
  components?: ComponentLocale;
  table: {
    /** 空态默认标题（emptyText 未传时使用）。 */
    empty: string;
    dragSort?: string;
    selectAll?: string;
    selectRow?: string;
    collapse?: string;
    expand?: string;
    filterPlaceholder?: string;
    filter?: (column: string) => string;
    resizeColumn?: string;
  };
  proTable: {
    /** 底部总条数文案（参数化）。 */
    total: (count: number) => string;
    reload: string;
    density: string;
    /** Density toolbar button label with its current value. */
    densityValue: (density: string) => string;
    columnSetting: string;
    fullscreen: string;
    exitFullscreen: string;
    /** 列设置浮层标题。 */
    columnsTitle: string;
    /** 批量条：已选 N 项（参数化）。 */
    selected: (count: number) => string;
    /** 批量条：清空选择。 */
    clearSelection: string;
    /** 每页条数选项文案（参数化，如「10 条/页」）。 */
    pageSize: (count: number) => string;
    /** cursor 分页模式：上一页按钮。 */
    prevPage: string;
    /** cursor 分页模式：下一页按钮。 */
    nextPage: string;
  };
  adminLayout: {
    collapse: string;
    expand: string;
    closeTab: string;
    tabActions: string;
    closeOthers: string;
    closeAll: string;
    closeLeft: string;
    closeRight: string;
    refreshTab: string;
    scrollLeft: string;
    scrollRight: string;
  };
  modalForm: {
    submit: string;
    cancel: string;
  };
  editableTable: {
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    add: string;
    actions: string;
    empty: string;
  };
  proForm: {
    submit: string;
    reset: string;
  };
  stepsForm: {
    prev: string;
    next: string;
    submit: string;
  };
  drawer: {
    /** 右上角关闭按钮的无障碍名。 */
    close: string;
  };
  loginForm: {
    title: string;
    username: string;
    password: string;
    remember: string;
    submit: string;
    usernameRequired: string;
    passwordRequired: string;
  };
  clickCaptcha: {
    /** 默认提示文案（消费方可用 hintText 覆盖）。 */
    hint: string;
    /** 提示图 alt。 */
    hintImageAlt: string;
    /** 点选区 aria-label（含键盘操作说明）。 */
    areaLabel: string;
    /** 进度播报前缀，形如「已选点位 1/3」。 */
    selected: string;
    undo: string;
    refresh: string;
    verifying: string;
    failed: string;
    success: string;
    imageError: string;
  };
  passwordGenerator: {
    /** 模式切换：字符密码 / 密码短语。 */
    password: string;
    passphrase: string;
    regenerate: string;
    copy: string;
    copied: string;
    /** 强度条前缀与四个档位名。 */
    strength: string;
    weak: string;
    fair: string;
    good: string;
    strong: string;
    /** 密码模式参数。 */
    length: string;
    uppercase: string;
    lowercase: string;
    digits: string;
    special: string;
    minDigits: string;
    minSpecial: string;
    avoidAmbiguous: string;
    /** 短语模式参数。 */
    words: string;
    separator: string;
    capitalize: string;
    includeNumber: string;
    /** 熵值单位，及结果区的无障碍名称。 */
    entropyUnit: string;
    result: string;
    /** 环境缺少 crypto.getRandomValues 时的兜底提示。 */
    unavailable: string;
  };
}

export interface ComponentLocale {
  popconfirm: { confirm: string; cancel: string };
  toast: { close: string };
  alert: { close: string };
  promptInput: { placeholder: string; stop: string; send: string };
  codeBlock: {
    copy: string;
    copied: string;
    region: (language?: string) => string;
  };
  markdown: { dataTable: string };
  anchor: { navigation: string };
  rating: {
    value: (value: number, max: number) => string;
    group: (max: number) => string;
    star: (value: number) => string;
  };
  heroVideoDialog: { play: string; close: string; iframeTitle: string };
  messageActions: {
    copy: string;
    copied: string;
    regenerate: string;
    like: string;
    dislike: string;
  };
  thinkingBlock: { title: string };
  toolCall: {
    pending: string;
    running: string;
    success: string;
    error: string;
    input?: string;
    output?: string;
  };
  carousel: {
    label: string;
    slide: (index: number, count: number) => string;
    previous: string;
    next: string;
    navigation: string;
    goTo: (index: number) => string;
  };
  steps: { label: string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  tour?: {
    dialog: string;
    close: string;
    skip: string;
    previous: string;
    next: string;
    finish: string;
    progress: (current: number, total: number) => string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  calendar?: {
    label: string;
    previousPage: string;
    nextPage: string;
    weekdays: readonly string[];
    months: readonly string[];
    monthTitle: (year: number, month: number) => string;
    yearTitle: (year: number) => string;
    today: string;
    thisMonth: string;
    thisYear: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  scheduler?: {
    views: Record<"month" | "week" | "day" | "resource", string>;
    previous: string;
    next: string;
    today: string;
    viewSwitcher: string;
    weekdays: readonly string[];
    monthTitle: (year: number, month: number) => string;
    weekDate: (month: number, day: number) => string;
    dayTitle: (year: number, month: number, day: number) => string;
    dayColumn: (month: number, day: number) => string;
    more: (count: number) => string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  mentions?: { suggestions: string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  chip?: { remove: string };
  combobox?: { clear: string; remove: string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  tag?: { remove: string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  tree?: {
    label: string;
    searchPlaceholder: string;
    noMatches: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  markdownEditor?: {
    editor: string;
    toolbar: string;
    bold: string;
    italic: string;
    strikethrough: string;
    inlineCode: string;
    heading1: string;
    heading2: string;
    heading3: string;
    unorderedList: string;
    orderedList: string;
    blockquote: string;
    codeBlock: string;
    link: string;
    horizontalRule: string;
    linkUrl: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  datePicker?: {
    clear: string;
    /** Optional so dictionaries created before picker-specific placeholders remain compatible. */
    date?: string;
    month?: string;
    year?: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  dateTimePicker?: {
    placeholder: string;
    clear: string;
    hour: string;
    minute: string;
    second: string;
    now: string;
    confirm: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  timeField?: {
    time: string;
    hour: string;
    minute: string;
    second: string;
    empty: string;
    clear: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  video?: {
    playVideo: string;
    replay: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    playbackSpeed: string;
    pictureInPicture: string;
    exitPictureInPicture: string;
    fullscreen: string;
    exitFullscreen: string;
  };
  numberField: { decrement: string; increment: string };
  pagination: {
    total: (count: number) => string;
    first: string;
    previous: string;
    page: (page: number) => string;
    more: string;
    next: string;
    last: string;
    jump: string;
    jumpPrefix: string;
    jumpSuffix: string;
  };
  searchForm: {
    selectPlaceholder: string;
    submit: string;
    reset: string;
    expand: string;
    collapse: string;
  };
  flow: {
    canvas: string;
    node: string;
    source: string;
    target: string;
    zoomIn: string;
    zoomOut: string;
    fitView: string;
    deleteNode: string;
    deleteEdge: string;
    autoLayout: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  creditCard?: {
    card: string;
    cardholder: string;
    expires: string;
    unionPay: string;
    endingIn: (brand: string, lastFour: string) => string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  emojiPicker?: {
    search: string;
    noResults: string;
    recentlyUsed: string;
    categories: Record<
      "smileys" | "gestures" | "animals" | "food" | "activity" | "objects" | "symbols",
      string
    >;
  };
  chatMessage?: {
    me: string;
    sending: string;
    sent: string;
    read: string;
  };
  navMenu?: { navigation: string };
  /** Default formatter locale for RelativeTime when its locale prop is omitted. */
  relativeTime?: { locale: "zh" | "en" };
  regionSelect?: { error: string; loading: string; canvas: string };
  remoteSelect?: {
    placeholder: string;
    empty: string;
    loading: string;
    total: (count: number) => string;
    loaded: (count: number) => string;
    loadMore: string;
    noMore: string;
  };
  select?: { search: string; empty: string; loading: string; separator: string; clear: string };
  viewport?: { devicePresets: string; tablet: string; phone: string };
  artifact?: { expand: string; collapse: string };
  banner?: { close: string };
  eventStream?: { empty: string; overriddenPrefix: string };
  fab?: { action: string };
  fileTree?: { search: string };
  treeSelect?: { placeholder: string; clear: string };
  agentPlan?: { title: string };
  list?: { empty: string; loadMore: string };
  spinner?: { loading: string };
  animatedThemeToggler?: { switchToLight: string; switchToDark: string };
  backTop?: { backToTop: string };
  pageHeader?: { back: string };
  secretField?: { show: string; hide: string; copy: string; copied: string };
  kanban?: { emptyColumn: string };
  gantt?: { chart: string; empty: string; process: string; month: (month: number) => string };
  funnel?: { chart: string; conversion: string };
  scopeMatrix?: {
    duplicate: string;
    count: (count: number) => string;
    emptyAllow: string;
    empty: string;
    remove: (value: string) => string;
    add: string;
    allow: string;
    deny: string;
    placeholder: string;
    allowHint: string;
    denyHint: string;
    unrestricted: string;
    denyOnly: (denyLabel: React.ReactNode, count: number) => string;
    allowOnly: (allowLabel: React.ReactNode, count: number) => string;
    combined: (
      denyLabel: React.ReactNode,
      denyCount: number,
      allowLabel: React.ReactNode,
      allowCount: number,
    ) => string;
  };
  interceptCard?: {
    severity: Record<"block" | "confirm" | "notice", string>;
    violation: string;
    suggestion: string;
    source: string;
    overridden: string;
    override: string;
    overridePlaceholder: string;
    processing: string;
    confirmOverride: string;
    cancel: string;
  };
  upload?: {
    dropLabel: string;
    buttonLabel: string;
    progress: (name: string) => string;
    remove: (name: string) => string;
    reorder: (name: string) => string;
    selected: (count: number, limit: number) => string;
  };
  jsonViewer?: { copy: string; copied: string };
  staggeredMenu?: {
    brand: string;
    menu: string;
    close: string;
    openMenu: string;
    closeMenu: string;
    social: string;
  };
  transfer?: {
    allRight: string;
    right: string;
    left: string;
    allLeft: string;
    selectAll: (title?: string) => string;
    search: (title?: string) => string;
    noMatches: string;
    empty: string;
    source: string;
    selected: string;
    searchPlaceholder: string;
  };
  queueLane?: {
    count: (count: number) => string;
    empty: string;
    more: (count: number) => string;
  };
  socialButton?: {
    providers: Record<
      "wechat" | "alipay" | "qq" | "weibo" | "github" | "google" | "apple" | "x",
      string
    >;
    signInWith: (provider: string) => string;
  };
  typingDots?: { typing: string };
  countrySelect?: {
    placeholder: string;
    searchPlaceholder: string;
    name: (chinese: string, english: string) => string;
    secondaryName: (chinese: string, english: string) => string | null;
  };
  chromaGrid?: { demo: readonly { title: string; subtitle: string }[] };
  colorPicker?: { hex: string; rgb: string; hsl: string; format: string };
  imageCropper?: { confirm: string; cancel: string; zoom: string };
  iconPicker?: { searchPlaceholder: string; empty: string; clear: string; recent: string };
  profileCard?: {
    name: string;
    title: string;
    status: string;
    contact: string;
    avatar: (name: string) => string;
    contactName: (name: string) => string;
  };
  regionCascader?: {
    provinceCity: string;
    full: string;
    searchPlaceholder: string;
    name: (code: string, chinese: string) => string;
  };
  voiceRecord?: {
    idle: string;
    recording: string;
    processing: string;
    processingAria: string;
    stopRecording: string;
    holdToTalk: string;
  };
  bubbleMenu?: {
    home: string;
    about: string;
    work: string;
    blog: string;
    contact: string;
    toggle: string;
    navigation: string;
    menuLink: string;
  };
  serviceMessage?: { footer: string; action: string; more: string };
  appLauncher?: {
    all: string;
    empty: string;
    search: string;
    categories: string;
  };
  colorField?: { openPicker: string };
  dateRangePicker?: {
    today: string;
    lastDays: (days: number) => string;
    thisMonth: string;
    startDate: string;
    endDate: string;
    month: (year: number, month: number) => string;
    clear: string;
    previousMonth: string;
    nextMonth: string;
  };
  threadList?: { title: string; empty: string; deleteThread: string };
  sankey?: { chart: string };
  diffStat?: { added: string; modified: string; deleted: string; renamed: string };
  deployStatus?: {
    queued: string;
    building: string;
    ready: string;
    error: string;
    canceled: string;
    skipped: string;
  };
  codeReviewThread?: {
    suggestedChange: string;
    adoptSuggestion: string;
    commentCount: (count: number) => string;
    resolved: string;
    falsePositive: string;
    markResolved: string;
    reopen: string;
    replyPlaceholder: string;
    reply: string;
    severities: { critical: string; major: string; minor: string; info: string };
  };
  navbar?: { openMenu: string; closeMenu: string };
  tabBar?: { navigation: string };
  snippet?: { copy: string; copied: string };
  pullToRefresh?: { pulling: string; armed: string; refreshing: string };
  livePlayer?: { follow: string; followed: string };
  liveChat?: {
    pinned: string;
    newMessages: (count: number) => string;
    entered: string;
    followed: string;
    sent: string;
    /** Optional so custom dictionaries created before localized message punctuation stay compatible. */
    messageSeparator?: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  liveProductCard?: {
    presenting: string;
    sold: (count: number) => string;
    remaining: (count: number) => string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  sortable?: { handle: (index: number) => string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  domeGallery?: {
    label: string;
    image: (index: number) => string;
    viewImage: string;
    enlargedView: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  heatmap?: {
    empty: string;
    tooltip: (y: string | number, x: string | number, value: string) => string;
    legend: (min: string, max: string) => string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  contributionGraph?: {
    weekdays: readonly string[];
    month: (month: number) => string;
    tooltip: (date: string, count: number, present: boolean) => string;
    summary: (days: number, total: number) => string;
    less: string;
    more: string;
  };
  cardNav?: { expandMenu: string; collapseMenu: string };
  confirmCard?: {
    title: string;
    confirm: string;
    edit: string;
    confirmed: string;
    editing: string;
  };
  inputOtp?: { label: string };
  logoLoop?: { label: string; link: string };
  timePicker?: {
    placeholder: string;
    clear: string;
    hour: string;
    minute: string;
    second: string;
    now: string;
    confirm: string;
  };
  beianFooter?: { icp: string };
  infiniteMenu?: {
    openItem: (title: string) => string;
    openActive: string;
    placeholderTitle: (index: number) => string;
    placeholderDescription: string;
  };
  lanyard?: { title: string; subtitle: string };
  listbox?: { label: string };
  stepper?: { progress: string };
  documentSheet?: { print: string };
  mathText?: { blank: string; rowSeparator: string };
  modelViewer?: { reset: string };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  coupon?: {
    available: string;
    claimed: string;
    used: string;
    expired: string;
    noMinimumSpend: string;
    minimumSpend: (amount: number) => string;
    /** Formats the complete discount value, for example 8.5折 or 15% off. */
    formatDiscount?: (discount: number) => string;
    /** @deprecated Kept only so older custom dictionaries remain type-compatible. */
    discountSuffix?: string;
    freeShipping: string;
  };
  /** Optional so existing custom component dictionaries remain source-compatible. */
  colorSwatchPicker?: { label: string };
}

const zhComponents: ComponentLocale = {
  popconfirm: { confirm: "确认", cancel: "取消" },
  toast: { close: "关闭" },
  alert: { close: "关闭" },
  promptInput: { placeholder: "发消息…", stop: "停止生成", send: "发送" },
  codeBlock: {
    copy: "复制",
    copied: "已复制",
    region: (language) => (language ? `${language} 代码` : "代码"),
  },
  markdown: { dataTable: "数据表格" },
  anchor: { navigation: "锚点导航" },
  rating: {
    value: (value, max) => `评分 ${value} / ${max}`,
    group: (max) => `评分，共 ${max} 级`,
    star: (value) => `${value} 星`,
  },
  heroVideoDialog: { play: "播放视频", close: "关闭", iframeTitle: "视频" },
  video: {
    playVideo: "播放视频",
    replay: "重新播放",
    play: "播放",
    pause: "暂停",
    mute: "静音",
    unmute: "取消静音",
    playbackSpeed: "播放速度",
    pictureInPicture: "画中画",
    exitPictureInPicture: "退出画中画",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
  },
  messageActions: {
    copy: "复制",
    copied: "已复制",
    regenerate: "重新生成",
    like: "赞",
    dislike: "踩",
  },
  thinkingBlock: { title: "思考过程" },
  toolCall: {
    pending: "等待",
    running: "运行中",
    success: "完成",
    error: "失败",
    input: "参数",
    output: "结果",
  },
  carousel: {
    label: "轮播",
    slide: (index, count) => `第 ${index} / ${count} 张`,
    previous: "上一张",
    next: "下一张",
    navigation: "幻灯片导航",
    goTo: (index) => `转到第 ${index} 张`,
  },
  steps: { label: "步骤" },
  tour: {
    dialog: "引导",
    close: "关闭引导",
    skip: "跳过",
    previous: "上一步",
    next: "下一步",
    finish: "完成",
    progress: (current, total) => `第 ${current} 步，共 ${total} 步`,
  },
  calendar: {
    label: "日历",
    previousPage: "上一页",
    nextPage: "下一页",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    months: [
      "1 月",
      "2 月",
      "3 月",
      "4 月",
      "5 月",
      "6 月",
      "7 月",
      "8 月",
      "9 月",
      "10 月",
      "11 月",
      "12 月",
    ],
    monthTitle: (year, month) => `${year} 年 ${month} 月`,
    yearTitle: (year) => `${year} 年`,
    today: "今天",
    thisMonth: "本月",
    thisYear: "今年",
  },
  scheduler: {
    views: { month: "月", week: "周", day: "日", resource: "资源" },
    previous: "上一个",
    next: "下一个",
    today: "今天",
    viewSwitcher: "视图切换",
    weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    monthTitle: (year, month) => `${year} 年 ${month} 月`,
    weekDate: (month, day) => `${month}/${day}`,
    dayTitle: (year, month, day) => `${year} 年 ${month} 月 ${day} 日`,
    dayColumn: (month, day) => `${month}月${day}日`,
    more: (count) => `+${count} 更多`,
  },
  mentions: { suggestions: "提及候选" },
  chip: { remove: "移除" },
  combobox: { clear: "清除", remove: "移除" },
  tag: { remove: "移除" },
  tree: {
    label: "树",
    searchPlaceholder: "搜索",
    noMatches: "无匹配项",
  },
  markdownEditor: {
    editor: "Markdown 编辑器",
    toolbar: "格式工具栏",
    bold: "加粗",
    italic: "斜体",
    strikethrough: "删除线",
    inlineCode: "行内代码",
    heading1: "标题 1",
    heading2: "标题 2",
    heading3: "标题 3",
    unorderedList: "无序列表",
    orderedList: "有序列表",
    blockquote: "引用",
    codeBlock: "代码块",
    link: "链接",
    horizontalRule: "分割线",
    linkUrl: "链接地址",
  },
  datePicker: {
    clear: "清除",
    date: "选择日期",
    month: "选择月份",
    year: "选择年份",
  },
  dateTimePicker: {
    placeholder: "选择日期时间",
    clear: "清除",
    hour: "时",
    minute: "分",
    second: "秒",
    now: "此刻",
    confirm: "确定",
  },
  timeField: {
    time: "时间",
    hour: "小时",
    minute: "分钟",
    second: "秒",
    empty: "空",
    clear: "清除",
  },
  numberField: { decrement: "减少", increment: "增加" },
  pagination: {
    total: (count) => `共 ${count} 条`,
    first: "跳到首页",
    previous: "上一页",
    page: (page) => `第 ${page} 页`,
    more: "更多页面",
    next: "下一页",
    last: "跳到末页",
    jump: "跳至第几页",
    jumpPrefix: "跳至",
    jumpSuffix: "页",
  },
  searchForm: {
    selectPlaceholder: "请选择",
    submit: "查询",
    reset: "重置",
    expand: "展开",
    collapse: "收起",
  },
  flow: {
    canvas: "工作流画布",
    node: "工作流节点",
    source: "输出",
    target: "输入",
    zoomIn: "放大",
    zoomOut: "缩小",
    fitView: "适配视图",
    deleteNode: "删除节点",
    deleteEdge: "删除连线",
    autoLayout: "智能排版",
  },
  creditCard: {
    card: "银行卡",
    cardholder: "持卡人",
    expires: "有效期",
    unionPay: "银联",
    endingIn: (brand, lastFour) => `${brand} 尾号 ${lastFour}`,
  },
  emojiPicker: {
    search: "搜索表情",
    noResults: "没有匹配的表情",
    recentlyUsed: "最近使用",
    categories: {
      smileys: "笑脸",
      gestures: "手势",
      animals: "动物",
      food: "食物",
      activity: "活动",
      objects: "物品",
      symbols: "符号",
    },
  },
  chatMessage: { me: "我", sending: "发送中", sent: "已送达", read: "已读" },
  navMenu: { navigation: "侧边导航" },
  relativeTime: { locale: "zh" },
  regionSelect: { error: "图片加载失败", loading: "载入图片…", canvas: "区域选择画布" },
  remoteSelect: {
    placeholder: "请选择",
    empty: "无匹配数据",
    loading: "加载中…",
    total: (count) => `共 ${count} 条`,
    loaded: (count) => `已加载 ${count} 条`,
    loadMore: "滚动加载更多",
    noMore: "没有更多了",
  },
  select: { search: "搜索", empty: "无匹配项", loading: "加载中", separator: "、", clear: "清除" },
  viewport: { devicePresets: "设备预设", tablet: "平板", phone: "手机" },
  artifact: { expand: "展开全文", collapse: "收起" },
  banner: { close: "关闭" },
  eventStream: { empty: "暂无事件", overriddenPrefix: "已放行：" },
  fab: { action: "操作" },
  fileTree: { search: "搜索文件" },
  treeSelect: { placeholder: "请选择", clear: "清除" },
  agentPlan: { title: "执行计划" },
  list: { empty: "暂无数据", loadMore: "加载更多" },
  spinner: { loading: "加载中" },
  animatedThemeToggler: { switchToLight: "切换到亮色", switchToDark: "切换到暗色" },
  backTop: { backToTop: "回到顶部" },
  pageHeader: { back: "返回" },
  secretField: { show: "显示", hide: "隐藏", copy: "复制", copied: "已复制" },
  kanban: { emptyColumn: "拖拽卡片到此" },
  gantt: {
    chart: "项目排期甘特图",
    empty: "暂无排期数据",
    process: "工序",
    month: (month) => `${month}月`,
  },
  funnel: { chart: "漏斗图", conversion: "转化" },
  scopeMatrix: {
    duplicate: "已存在相同模式",
    count: (count) => `${count} 条`,
    emptyAllow: "未设置（不启用白名单）",
    empty: "未设置",
    remove: (value) => `移除 ${value}`,
    add: "添加",
    allow: "允许",
    deny: "禁止",
    placeholder: "输入模式后回车",
    allowHint: "留空表示不启用白名单，此时只受「禁止」约束",
    denyHint: "命中即拒绝，优先级高于「允许」",
    unrestricted: "当前未设置任何范围限制。",
    denyOnly: (denyLabel, count) =>
      `未启用白名单：除命中「${String(denyLabel)}」的 ${count} 条模式外，其余全部允许。`,
    allowOnly: (allowLabel, count) =>
      `仅允许命中「${String(allowLabel)}」的 ${count} 条模式，其余全部拒绝。`,
    combined: (denyLabel, denyCount, allowLabel, allowCount) =>
      `先看「${String(denyLabel)}」（${denyCount} 条）：命中即拒绝；未命中的再看「${String(
        allowLabel,
      )}」（${allowCount} 条），命中才允许。`,
  },
  interceptCard: {
    severity: { block: "已拦截", confirm: "待确认", notice: "提醒" },
    violation: "违反点",
    suggestion: "建议改法",
    source: "依据：",
    overridden: "已放行",
    override: "放行本次",
    overridePlaceholder: "为什么这次可以放行？（必填，会进入审计记录）",
    processing: "处理中…",
    confirmOverride: "确认放行",
    cancel: "取消",
  },
  upload: {
    dropLabel: "点击或拖拽文件到此处",
    buttonLabel: "选择文件",
    progress: (name) => `${name} 上传进度`,
    remove: (name) => `移除 ${name}`,
    reorder: (name) => `拖拽排序 ${name}`,
    selected: (count, limit) => `已选 ${count}/${limit}`,
  },
  jsonViewer: { copy: "复制", copied: "已复制" },
  staggeredMenu: {
    brand: "瑚琏",
    menu: "菜单",
    close: "关闭",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    social: "社交",
  },
  transfer: {
    allRight: "全部移入",
    right: "移入选中",
    left: "移出选中",
    allLeft: "全部移出",
    selectAll: (title) => (title ? `全选${title}` : "全选"),
    search: (title) => (title ? `搜索${title}` : "搜索"),
    noMatches: "无匹配项",
    empty: "暂无数据",
    source: "源列表",
    selected: "已选",
    searchPlaceholder: "搜索",
  },
  queueLane: {
    count: (count) => `${count} 条`,
    empty: "队列空闲",
    more: (count) => `还有 ${count} 条`,
  },
  socialButton: {
    providers: {
      wechat: "微信",
      alipay: "支付宝",
      qq: "QQ",
      weibo: "微博",
      github: "GitHub",
      google: "Google",
      apple: "Apple",
      x: "X",
    },
    signInWith: (provider) => `${provider}登录`,
  },
  typingDots: { typing: "正在输入" },
  countrySelect: {
    placeholder: "选择国家/地区",
    searchPlaceholder: "搜索国家 / 区号…",
    name: (chinese) => chinese,
    secondaryName: (_chinese, english) => english,
  },
  chromaGrid: {
    demo: [
      { title: "林屿", subtitle: "全栈工程师" },
      { title: "陈墨", subtitle: "DevOps 工程师" },
      { title: "苏黎", subtitle: "UI/UX 设计师" },
      { title: "周野", subtitle: "数据科学家" },
      { title: "金溪", subtitle: "移动端开发" },
      { title: "唐衍", subtitle: "云架构师" },
    ],
  },
  colorPicker: {
    hex: "十六进制颜色值",
    rgb: "RGB 颜色值",
    hsl: "HSL 颜色值",
    format: "颜色格式",
  },
  imageCropper: { confirm: "确认", cancel: "取消", zoom: "缩放" },
  iconPicker: {
    searchPlaceholder: "搜索图标",
    empty: "没有匹配的图标",
    clear: "清除",
    recent: "最近使用",
  },
  profileCard: {
    name: "瑚琏",
    title: "前端工程师",
    status: "在线",
    contact: "联系",
    avatar: (name) => `${name} 头像`,
    contactName: (name) => `联系 ${name}`,
  },
  regionCascader: {
    provinceCity: "请选择省/市",
    full: "请选择省/市/区",
    searchPlaceholder: "搜索省/市/区…",
    name: (_code, chinese) => chinese,
  },
  voiceRecord: {
    idle: "按住说话",
    recording: "松开结束",
    processing: "处理中…",
    processingAria: "处理中",
    stopRecording: "松开结束录音",
    holdToTalk: "按住说话",
  },
  bubbleMenu: {
    home: "首页",
    about: "关于",
    work: "作品",
    blog: "博客",
    contact: "联系",
    toggle: "切换菜单",
    navigation: "主导航",
    menuLink: "菜单链接",
  },
  serviceMessage: { footer: "进入小程序查看", action: "小程序", more: "更多" },
  appLauncher: {
    all: "全部",
    empty: "没有匹配的应用",
    search: "搜索应用",
    categories: "应用分类",
  },
  colorField: { openPicker: "打开取色器" },
  dateRangePicker: {
    today: "今天",
    lastDays: (days) => `最近 ${days} 天`,
    thisMonth: "本月",
    startDate: "开始日期",
    endDate: "结束日期",
    month: (year, month) => `${year} 年 ${month} 月`,
    clear: "清除",
    previousMonth: "上个月",
    nextMonth: "下个月",
  },
  threadList: { title: "历史", empty: "暂无历史", deleteThread: "删除会话" },
  sankey: { chart: "桑基流向图" },
  diffStat: { added: "新增", modified: "修改", deleted: "删除", renamed: "重命名" },
  deployStatus: {
    queued: "排队中",
    building: "构建中",
    ready: "已上线",
    error: "失败",
    canceled: "已取消",
    skipped: "已跳过",
  },
  codeReviewThread: {
    suggestedChange: "建议修改",
    adoptSuggestion: "采纳建议",
    commentCount: (count) => `${count} 条批注`,
    resolved: "已解决",
    falsePositive: "误报",
    markResolved: "标记已解决",
    reopen: "重新打开",
    replyPlaceholder: "回复这条批注…",
    reply: "回复",
    severities: { critical: "严重", major: "重要", minor: "次要", info: "提示" },
  },
  navbar: { openMenu: "打开菜单", closeMenu: "关闭菜单" },
  tabBar: { navigation: "底部导航" },
  snippet: { copy: "复制", copied: "已复制" },
  pullToRefresh: { pulling: "下拉刷新", armed: "释放刷新", refreshing: "刷新中…" },
  livePlayer: { follow: "+ 关注", followed: "已关注" },
  liveChat: {
    pinned: "置顶",
    newMessages: (count) => `${count} 条新消息 ↓`,
    entered: "来了",
    followed: "关注了主播 ❤",
    sent: "送出",
    messageSeparator: "：",
  },
  liveProductCard: {
    presenting: "讲解中",
    sold: (count) => `已售 ${count}`,
    remaining: (count) => `仅剩 ${count}`,
  },
  sortable: { handle: (index) => `拖拽排序（第 ${index} 项）` },
  domeGallery: {
    label: "可拖拽旋转的球面图库",
    image: (index) => `图片 ${index}`,
    viewImage: "查看图片",
    enlargedView: "放大查看",
  },
  heatmap: {
    empty: "无数据",
    tooltip: (y, x, value) => `${y} · ${x}：${value}`,
    legend: (min, max) => `色阶：${min} 至 ${max}`,
  },
  contributionGraph: {
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    month: (month) => `${month}月`,
    tooltip: (date, count, present) =>
      present || count > 0 ? `${date} · ${count} 次` : `${date} · 无贡献`,
    summary: (days, total) => `过去 ${days} 天共 ${total} 次贡献`,
    less: "少",
    more: "多",
  },
  cardNav: { expandMenu: "展开菜单", collapseMenu: "收起菜单" },
  confirmCard: {
    title: "请确认以下信息",
    confirm: "确认无误",
    edit: "需要修改",
    confirmed: "已确认",
    editing: "修改中",
  },
  inputOtp: { label: "验证码" },
  logoLoop: { label: "合作伙伴 logo", link: "logo 链接" },
  timePicker: {
    placeholder: "选择时间",
    clear: "清除",
    hour: "时",
    minute: "分",
    second: "秒",
    now: "此刻",
    confirm: "确定",
  },
  beianFooter: { icp: "ICP备案" },
  infiniteMenu: {
    openItem: (title) => `打开 ${title}`,
    openActive: "打开激活项",
    placeholderTitle: (index) => `菜单项 ${index}`,
    placeholderDescription: "占位项 · 传入 items 替换",
  },
  lanyard: { title: "瑚琏 · HULIAN", subtitle: "拖动摆一摆" },
  listbox: { label: "选项列表" },
  stepper: { progress: "步骤进度" },
  documentSheet: { print: "打印" },
  mathText: { blank: "填空", rowSeparator: "；" },
  modelViewer: { reset: "重置视角" },
  coupon: {
    available: "立即领取",
    claimed: "去使用",
    used: "已使用",
    expired: "已过期",
    noMinimumSpend: "无门槛",
    minimumSpend: (amount) => `满${amount}可用`,
    formatDiscount: (discount) => `${discount}折`,
    freeShipping: "包邮",
  },
  colorSwatchPicker: { label: "颜色色板" },
};

const enComponents: ComponentLocale = {
  popconfirm: { confirm: "Confirm", cancel: "Cancel" },
  toast: { close: "Close" },
  alert: { close: "Close" },
  promptInput: { placeholder: "Message…", stop: "Stop generating", send: "Send" },
  codeBlock: {
    copy: "Copy",
    copied: "Copied",
    region: (language) => (language ? `${language} code` : "Code"),
  },
  markdown: { dataTable: "Data table" },
  anchor: { navigation: "On this page" },
  rating: {
    value: (value, max) => `Rating ${value} / ${max}`,
    group: (max) => `Rating, ${max} levels`,
    star: (value) => `${value} ${value === 1 ? "star" : "stars"}`,
  },
  heroVideoDialog: { play: "Play video", close: "Close", iframeTitle: "Video" },
  video: {
    playVideo: "Play video",
    replay: "Replay",
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    playbackSpeed: "Playback speed",
    pictureInPicture: "Picture in picture",
    exitPictureInPicture: "Exit picture in picture",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
  },
  messageActions: {
    copy: "Copy",
    copied: "Copied",
    regenerate: "Regenerate",
    like: "Like",
    dislike: "Dislike",
  },
  thinkingBlock: { title: "Thinking" },
  toolCall: {
    pending: "Pending",
    running: "Running",
    success: "Complete",
    error: "Failed",
    input: "Input",
    output: "Output",
  },
  carousel: {
    label: "Carousel",
    slide: (index, count) => `Slide ${index} of ${count}`,
    previous: "Previous slide",
    next: "Next slide",
    navigation: "Slide navigation",
    goTo: (index) => `Go to slide ${index}`,
  },
  steps: { label: "Steps" },
  tour: {
    dialog: "Tour",
    close: "Close tour",
    skip: "Skip",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    progress: (current, total) => `Step ${current} of ${total}`,
  },
  calendar: {
    label: "Calendar",
    previousPage: "Previous page",
    nextPage: "Next page",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    monthTitle: (year, month) =>
      `${
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][month - 1]
      } ${year}`,
    yearTitle: (year) => `${year}`,
    today: "Today",
    thisMonth: "This month",
    thisYear: "This year",
  },
  scheduler: {
    views: { month: "Month", week: "Week", day: "Day", resource: "Resources" },
    previous: "Previous",
    next: "Next",
    today: "Today",
    viewSwitcher: "View switcher",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    monthTitle: (year, month) =>
      `${
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][month - 1]
      } ${year}`,
    weekDate: (month, day) =>
      `${
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
          month - 1
        ]
      } ${day}`,
    dayTitle: (year, month, day) =>
      `${
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ][month - 1]
      } ${day}, ${year}`,
    dayColumn: (month, day) =>
      `${
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
          month - 1
        ]
      } ${day}`,
    more: (count) => `+${count} more`,
  },
  mentions: { suggestions: "Mention suggestions" },
  chip: { remove: "Remove" },
  combobox: { clear: "Clear", remove: "Remove" },
  tag: { remove: "Remove" },
  tree: {
    label: "Tree",
    searchPlaceholder: "Search",
    noMatches: "No matching items",
  },
  markdownEditor: {
    editor: "Markdown editor",
    toolbar: "Formatting toolbar",
    bold: "Bold",
    italic: "Italic",
    strikethrough: "Strikethrough",
    inlineCode: "Inline code",
    heading1: "Heading 1",
    heading2: "Heading 2",
    heading3: "Heading 3",
    unorderedList: "Unordered list",
    orderedList: "Ordered list",
    blockquote: "Blockquote",
    codeBlock: "Code block",
    link: "Link",
    horizontalRule: "Horizontal rule",
    linkUrl: "Link URL",
  },
  datePicker: {
    clear: "Clear",
    date: "Select date",
    month: "Select month",
    year: "Select year",
  },
  dateTimePicker: {
    placeholder: "Select date and time",
    clear: "Clear",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    now: "Now",
    confirm: "Confirm",
  },
  timeField: {
    time: "Time",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    empty: "Empty",
    clear: "Clear",
  },
  numberField: { decrement: "Decrease", increment: "Increase" },
  pagination: {
    total: (count) => `${count} items`,
    first: "First page",
    previous: "Previous page",
    page: (page) => `Page ${page}`,
    more: "More pages",
    next: "Next page",
    last: "Last page",
    jump: "Page to jump to",
    jumpPrefix: "Go to",
    jumpSuffix: "page",
  },
  searchForm: {
    selectPlaceholder: "Select",
    submit: "Search",
    reset: "Reset",
    expand: "Expand",
    collapse: "Collapse",
  },
  flow: {
    canvas: "Workflow canvas",
    node: "Workflow node",
    source: "Output",
    target: "Input",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fitView: "Fit view",
    deleteNode: "Delete node",
    deleteEdge: "Delete edge",
    autoLayout: "Auto layout",
  },
  creditCard: {
    card: "Card",
    cardholder: "Cardholder",
    expires: "Expires",
    unionPay: "UnionPay",
    endingIn: (brand, lastFour) => `${brand} ending in ${lastFour}`,
  },
  emojiPicker: {
    search: "Search emoji",
    noResults: "No matching emoji",
    recentlyUsed: "Recently used",
    categories: {
      smileys: "Smileys & emotion",
      gestures: "People & gestures",
      animals: "Animals & nature",
      food: "Food & drink",
      activity: "Activities",
      objects: "Objects",
      symbols: "Symbols",
    },
  },
  chatMessage: { me: "Me", sending: "Sending", sent: "Delivered", read: "Read" },
  navMenu: { navigation: "Sidebar navigation" },
  relativeTime: { locale: "en" },
  regionSelect: {
    error: "Failed to load image",
    loading: "Loading image…",
    canvas: "Region selection canvas",
  },
  remoteSelect: {
    placeholder: "Select",
    empty: "No matching data",
    loading: "Loading…",
    total: (count) => `${count} items`,
    loaded: (count) => `${count} loaded`,
    loadMore: "Scroll to load more",
    noMore: "No more results",
  },
  select: {
    search: "Search",
    empty: "No matching items",
    loading: "Loading",
    separator: ", ",
    clear: "Clear",
  },
  viewport: { devicePresets: "Device presets", tablet: "Tablet", phone: "Phone" },
  artifact: { expand: "Show all", collapse: "Collapse" },
  banner: { close: "Close" },
  eventStream: { empty: "No events", overriddenPrefix: "Allowed: " },
  fab: { action: "Action" },
  fileTree: { search: "Search files" },
  treeSelect: { placeholder: "Select", clear: "Clear" },
  agentPlan: { title: "Execution plan" },
  list: { empty: "No data", loadMore: "Load more" },
  spinner: { loading: "Loading" },
  animatedThemeToggler: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  backTop: { backToTop: "Back to top" },
  pageHeader: { back: "Back" },
  secretField: { show: "Show", hide: "Hide", copy: "Copy", copied: "Copied" },
  kanban: { emptyColumn: "Drop cards here" },
  gantt: {
    chart: "Project schedule Gantt chart",
    empty: "No schedule data",
    process: "Task",
    month: (month) => `${month}`,
  },
  funnel: { chart: "Funnel chart", conversion: "Conversion" },
  scopeMatrix: {
    duplicate: "This pattern already exists",
    count: (count) => `${count} ${count === 1 ? "item" : "items"}`,
    emptyAllow: "Not set (allowlist disabled)",
    empty: "Not set",
    remove: (value) => `Remove ${value}`,
    add: "Add",
    allow: "Allow",
    deny: "Deny",
    placeholder: "Enter a pattern and press Enter",
    allowHint: "Leave empty to disable the allowlist; only deny rules will apply.",
    denyHint: "Matches are denied and take priority over allow rules.",
    unrestricted: "No scope restrictions are currently set.",
    denyOnly: (denyLabel, count) =>
      `The allowlist is disabled. Everything is allowed except the ${count} ${
        count === 1 ? "pattern" : "patterns"
      } matching “${String(denyLabel)}”.`,
    allowOnly: (allowLabel, count) =>
      `Only the ${count} ${count === 1 ? "pattern" : "patterns"} matching “${String(
        allowLabel,
      )}” are allowed; everything else is denied.`,
    combined: (denyLabel, denyCount, allowLabel, allowCount) =>
      `Deny rules are evaluated first (${denyCount} under “${String(
        denyLabel,
      )}”); unmatched patterns must then match one of ${allowCount} under “${String(allowLabel)}”.`,
  },
  interceptCard: {
    severity: { block: "Blocked", confirm: "Confirmation required", notice: "Notice" },
    violation: "Violation",
    suggestion: "Suggested fix",
    source: "Source:",
    overridden: "Allowed",
    override: "Allow once",
    overridePlaceholder: "Why can this be allowed? (required and recorded in the audit log)",
    processing: "Processing…",
    confirmOverride: "Confirm override",
    cancel: "Cancel",
  },
  upload: {
    dropLabel: "Click or drag files here",
    buttonLabel: "Choose files",
    progress: (name) => `${name} upload progress`,
    remove: (name) => `Remove ${name}`,
    reorder: (name) => `Reorder ${name}`,
    selected: (count, limit) => `${count}/${limit} selected`,
  },
  jsonViewer: { copy: "Copy", copied: "Copied" },
  staggeredMenu: {
    brand: "Hulian",
    menu: "Menu",
    close: "Close",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    social: "Social",
  },
  transfer: {
    allRight: "Move all right",
    right: "Move selected right",
    left: "Move selected left",
    allLeft: "Move all left",
    selectAll: (title) => (title ? `Select all ${title}` : "Select all"),
    search: (title) => (title ? `Search ${title}` : "Search"),
    noMatches: "No matching items",
    empty: "No data",
    source: "Source",
    selected: "Selected",
    searchPlaceholder: "Search",
  },
  queueLane: {
    count: (count) => `${count} ${count === 1 ? "item" : "items"}`,
    empty: "Queue is empty",
    more: (count) => `${count} more ${count === 1 ? "item" : "items"}`,
  },
  socialButton: {
    providers: {
      wechat: "WeChat",
      alipay: "Alipay",
      qq: "QQ",
      weibo: "Weibo",
      github: "GitHub",
      google: "Google",
      apple: "Apple",
      x: "X",
    },
    signInWith: (provider) => `Sign in with ${provider}`,
  },
  typingDots: { typing: "Typing" },
  countrySelect: {
    placeholder: "Select a country or region",
    searchPlaceholder: "Search countries or calling codes…",
    name: (_chinese, english) => english,
    secondaryName: () => null,
  },
  chromaGrid: {
    demo: [
      { title: "Lin Yu", subtitle: "Full-stack Engineer" },
      { title: "Chen Mo", subtitle: "DevOps Engineer" },
      { title: "Su Li", subtitle: "UI/UX Designer" },
      { title: "Zhou Ye", subtitle: "Data Scientist" },
      { title: "Jin Xi", subtitle: "Mobile Developer" },
      { title: "Tang Yan", subtitle: "Cloud Architect" },
    ],
  },
  colorPicker: {
    hex: "Hex color value",
    rgb: "RGB color value",
    hsl: "HSL color value",
    format: "Color format",
  },
  imageCropper: { confirm: "Confirm", cancel: "Cancel", zoom: "Zoom" },
  iconPicker: {
    searchPlaceholder: "Search icons",
    empty: "No matching icons",
    clear: "Clear",
    recent: "Recently used",
  },
  profileCard: {
    name: "Hulian",
    title: "Frontend Engineer",
    status: "Online",
    contact: "Contact",
    avatar: (name) => `${name} avatar`,
    contactName: (name) => `Contact ${name}`,
  },
  regionCascader: {
    provinceCity: "Select province/city",
    full: "Select province/city/district",
    searchPlaceholder: "Search province/city/district…",
    name: (code) =>
      ({
        "11": "Beijing",
        "12": "Tianjin",
        "13": "Hebei",
        "14": "Shanxi",
        "15": "Inner Mongolia",
        "21": "Liaoning",
        "22": "Jilin",
        "23": "Heilongjiang",
        "31": "Shanghai",
        "32": "Jiangsu",
        "33": "Zhejiang",
        "34": "Anhui",
        "35": "Fujian",
        "36": "Jiangxi",
        "37": "Shandong",
        "41": "Henan",
        "42": "Hubei",
        "43": "Hunan",
        "44": "Guangdong",
        "45": "Guangxi",
        "46": "Hainan",
        "50": "Chongqing",
        "51": "Sichuan",
        "52": "Guizhou",
        "53": "Yunnan",
        "54": "Tibet",
        "61": "Shaanxi",
        "62": "Gansu",
        "63": "Qinghai",
        "64": "Ningxia",
        "65": "Xinjiang",
        "1101": "Beijing Municipality",
        "110105": "Chaoyang District",
        "3101": "Shanghai Municipality",
        "310115": "Pudong New Area",
        "4401": "Guangzhou",
      })[code] ?? `Region ${code}`,
  },
  voiceRecord: {
    idle: "Hold to talk",
    recording: "Release to finish",
    processing: "Processing…",
    processingAria: "Processing",
    stopRecording: "Release to stop recording",
    holdToTalk: "Hold to talk",
  },
  bubbleMenu: {
    home: "Home",
    about: "About",
    work: "Work",
    blog: "Blog",
    contact: "Contact",
    toggle: "Toggle menu",
    navigation: "Main navigation",
    menuLink: "Menu link",
  },
  serviceMessage: { footer: "Open the mini app to view", action: "Mini app", more: "More" },
  appLauncher: {
    all: "All",
    empty: "No matching apps",
    search: "Search apps",
    categories: "App categories",
  },
  colorField: { openPicker: "Open color picker" },
  dateRangePicker: {
    today: "Today",
    lastDays: (days) => `Last ${days} days`,
    thisMonth: "This month",
    startDate: "Start date",
    endDate: "End date",
    month: (year, month) =>
      `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month - 1]} ${year}`,
    clear: "Clear",
    previousMonth: "Previous month",
    nextMonth: "Next month",
  },
  threadList: { title: "History", empty: "No history", deleteThread: "Delete conversation" },
  sankey: { chart: "Sankey diagram" },
  diffStat: { added: "Added", modified: "Modified", deleted: "Deleted", renamed: "Renamed" },
  deployStatus: {
    queued: "Queued",
    building: "Building",
    ready: "Ready",
    error: "Failed",
    canceled: "Canceled",
    skipped: "Skipped",
  },
  codeReviewThread: {
    suggestedChange: "Suggested change",
    adoptSuggestion: "Apply suggestion",
    commentCount: (count) => `${count} comments`,
    resolved: "Resolved",
    falsePositive: "False positive",
    markResolved: "Mark resolved",
    reopen: "Reopen",
    replyPlaceholder: "Reply to this comment…",
    reply: "Reply",
    severities: { critical: "Critical", major: "Major", minor: "Minor", info: "Info" },
  },
  navbar: { openMenu: "Open menu", closeMenu: "Close menu" },
  tabBar: { navigation: "Bottom navigation" },
  snippet: { copy: "Copy", copied: "Copied" },
  pullToRefresh: {
    pulling: "Pull to refresh",
    armed: "Release to refresh",
    refreshing: "Refreshing…",
  },
  livePlayer: { follow: "+ Follow", followed: "Following" },
  liveChat: {
    pinned: "Pinned",
    newMessages: (count) => `${count} new ${count === 1 ? "message" : "messages"} ↓`,
    entered: "joined",
    followed: "followed the host ❤",
    sent: "sent",
    messageSeparator: ":",
  },
  liveProductCard: {
    presenting: "Presenting",
    sold: (count) => `Sold ${count}`,
    remaining: (count) => `${count} left`,
  },
  sortable: { handle: (index) => `Reorder item ${index}` },
  domeGallery: {
    label: "Draggable rotating dome gallery",
    image: (index) => `Image ${index}`,
    viewImage: "View image",
    enlargedView: "Enlarged view",
  },
  heatmap: {
    empty: "No data",
    tooltip: (y, x, value) => `${y} · ${x}: ${value}`,
    legend: (min, max) => `Color scale: ${min} to ${max}`,
  },
  contributionGraph: {
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    month: (month) =>
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
        month - 1
      ] ?? String(month),
    tooltip: (date, count, present) => {
      const value =
        present || count > 0
          ? `${count} ${count === 1 ? "contribution" : "contributions"}`
          : "No contributions";
      return `${date} · ${value}`;
    },
    summary: (days, total) =>
      `${days} ${days === 1 ? "day" : "days"}, ${total} ${
        total === 1 ? "contribution" : "contributions"
      }`,
    less: "Less",
    more: "More",
  },
  cardNav: { expandMenu: "Open menu", collapseMenu: "Close menu" },
  confirmCard: {
    title: "Please confirm the following information",
    confirm: "Confirm",
    edit: "Edit",
    confirmed: "Confirmed",
    editing: "Editing",
  },
  inputOtp: { label: "Verification code" },
  logoLoop: { label: "Partner logos", link: "Logo link" },
  timePicker: {
    placeholder: "Select time",
    clear: "Clear",
    hour: "Hour",
    minute: "Minute",
    second: "Second",
    now: "Now",
    confirm: "Confirm",
  },
  beianFooter: { icp: "ICP filing" },
  infiniteMenu: {
    openItem: (title) => `Open ${title}`,
    openActive: "Open active item",
    placeholderTitle: (index) => `Menu item ${index}`,
    placeholderDescription: "Placeholder item · Replace via items",
  },
  lanyard: { title: "Hulian · HULIAN", subtitle: "Drag to swing" },
  listbox: { label: "Options" },
  stepper: { progress: "Step progress" },
  documentSheet: { print: "Print" },
  mathText: { blank: "Blank", rowSeparator: ";" },
  modelViewer: { reset: "Reset view" },
  coupon: {
    available: "Claim now",
    claimed: "Use now",
    used: "Used",
    expired: "Expired",
    noMinimumSpend: "No minimum spend",
    minimumSpend: (amount) => `Spend ¥${amount} to use`,
    formatDiscount: (discount) => `${Number(((10 - discount) * 10).toFixed(2))}% off`,
    freeShipping: "Free shipping",
  },
  colorSwatchPicker: { label: "Color swatches" },
};

/** 默认中文（zh-CN）。各值与组件原硬编码逐字一致，保证未包 Provider 时行为不变。 */
export const zhCN: Locale = {
  components: zhComponents,
  table: {
    empty: "暂无数据",
    dragSort: "拖拽排序",
    selectAll: "全选",
    selectRow: "选择行",
    collapse: "收起",
    expand: "展开",
    filterPlaceholder: "筛选…",
    filter: (column) => `筛选 ${column}`,
    resizeColumn: "调整列宽",
  },
  proTable: {
    total: (n) => `共 ${n} 条`,
    reload: "刷新",
    density: "密度",
    densityValue: (density) => `密度：${density}`,
    columnSetting: "列设置",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
    columnsTitle: "列展示",
    selected: (n) => `已选 ${n} 项`,
    clearSelection: "清空",
    pageSize: (n) => `${n} 条/页`,
    prevPage: "上一页",
    nextPage: "下一页",
  },
  adminLayout: {
    collapse: "收起侧栏",
    expand: "展开侧栏",
    closeTab: "关闭页签",
    tabActions: "页签操作",
    closeOthers: "关闭其他",
    closeAll: "关闭全部",
    closeLeft: "关闭左侧",
    closeRight: "关闭右侧",
    refreshTab: "刷新当前页",
    scrollLeft: "向左滚动",
    scrollRight: "向右滚动",
  },
  modalForm: {
    submit: "提交",
    cancel: "取消",
  },
  editableTable: {
    edit: "编辑",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    add: "新增一行",
    actions: "操作",
    empty: "暂无数据",
  },
  proForm: {
    submit: "提交",
    reset: "重置",
  },
  stepsForm: {
    prev: "上一步",
    next: "下一步",
    submit: "提交",
  },
  drawer: {
    close: "关闭",
  },
  loginForm: {
    title: "登录",
    username: "账号",
    password: "密码",
    remember: "记住我",
    submit: "登录",
    usernameRequired: "请输入账号",
    passwordRequired: "请输入密码",
  },
  clickCaptcha: {
    hint: "请依次点击图中的提示内容",
    hintImageAlt: "点击提示",
    areaLabel: "人机验证点选区：方向键移动准星，回车或空格落点，退格撤销",
    selected: "已选点位",
    undo: "撤销上一个点",
    refresh: "换一张",
    verifying: "校验中…",
    failed: "验证失败，请重新点选",
    success: "验证通过",
    imageError: "验证码图片加载失败，请点「换一张」重试",
  },
  passwordGenerator: {
    password: "密码",
    passphrase: "密码短语",
    regenerate: "重新生成",
    copy: "复制",
    copied: "已复制",
    strength: "强度",
    weak: "弱",
    fair: "一般",
    good: "强",
    strong: "很强",
    length: "长度",
    uppercase: "大写 A-Z",
    lowercase: "小写 a-z",
    digits: "数字 0-9",
    special: "符号 !@#$%^&*",
    minDigits: "最少数字",
    minSpecial: "最少符号",
    avoidAmbiguous: "排除形近字符",
    words: "词数",
    separator: "分隔符",
    capitalize: "首字母大写",
    includeNumber: "包含数字",
    entropyUnit: "bit",
    result: "生成结果",
    unavailable: "当前环境不支持安全随机数，无法生成",
  },
};

/** 英文（en-US），演示 i18n 可切换；消费者亦可 spread zhCN/enUS 自定义。 */
export const enUS: Locale = {
  components: enComponents,
  table: {
    empty: "No data",
    dragSort: "Reorder row",
    selectAll: "Select all",
    selectRow: "Select row",
    collapse: "Collapse",
    expand: "Expand",
    filterPlaceholder: "Filter…",
    filter: (column) => `Filter ${column}`,
    resizeColumn: "Resize column",
  },
  proTable: {
    total: (n) => `${n} items`,
    reload: "Refresh",
    density: "Density",
    densityValue: (density) => `Density: ${density}`,
    columnSetting: "Columns",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit fullscreen",
    columnsTitle: "Columns",
    selected: (n) => `${n} selected`,
    clearSelection: "Clear",
    pageSize: (n) => `${n} / page`,
    prevPage: "Previous",
    nextPage: "Next",
  },
  adminLayout: {
    collapse: "Collapse",
    expand: "Expand",
    closeTab: "Close tab",
    tabActions: "Tab actions",
    closeOthers: "Close others",
    closeAll: "Close all",
    closeLeft: "Close to the left",
    closeRight: "Close to the right",
    refreshTab: "Refresh",
    scrollLeft: "Scroll left",
    scrollRight: "Scroll right",
  },
  modalForm: {
    submit: "Submit",
    cancel: "Cancel",
  },
  editableTable: {
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    add: "Add row",
    actions: "Actions",
    empty: "No data",
  },
  proForm: {
    submit: "Submit",
    reset: "Reset",
  },
  stepsForm: {
    prev: "Previous",
    next: "Next",
    submit: "Submit",
  },
  drawer: {
    close: "Close",
  },
  loginForm: {
    title: "Sign in",
    username: "Username",
    password: "Password",
    remember: "Remember me",
    submit: "Sign in",
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
  },
  clickCaptcha: {
    hint: "Click the prompted targets in order",
    hintImageAlt: "Click prompt",
    areaLabel:
      "Click captcha area: arrow keys move the cursor, Enter or Space drops a point, Backspace undoes",
    selected: "Points selected",
    undo: "Undo last point",
    refresh: "Refresh image",
    verifying: "Verifying…",
    failed: "Verification failed, please try again",
    success: "Verified",
    imageError: "Captcha image failed to load — use Refresh to retry",
  },
  passwordGenerator: {
    password: "Password",
    passphrase: "Passphrase",
    regenerate: "Regenerate",
    copy: "Copy",
    copied: "Copied",
    strength: "Strength",
    weak: "Weak",
    fair: "Fair",
    good: "Good",
    strong: "Strong",
    length: "Length",
    uppercase: "Uppercase A-Z",
    lowercase: "Lowercase a-z",
    digits: "Digits 0-9",
    special: "Symbols !@#$%^&*",
    minDigits: "Min digits",
    minSpecial: "Min symbols",
    avoidAmbiguous: "Avoid ambiguous characters",
    words: "Words",
    separator: "Separator",
    capitalize: "Capitalize",
    includeNumber: "Include number",
    entropyUnit: "bit",
    result: "Generated secret",
    unavailable: "Secure randomness is unavailable in this environment",
  },
};

export const LocaleContext = createContext<Locale | null>(null);

/** 取当前 Locale；缺 ConfigProvider 时回退默认 zhCN（组件须能脱离 Provider 渲染，故不抛）。 */
export function useLocale(): Locale {
  return useContext(LocaleContext) ?? zhCN;
}

export function useComponentLocale(): ComponentLocale {
  return useLocale().components ?? zhComponents;
}
