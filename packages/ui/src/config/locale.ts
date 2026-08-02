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
  toolCall: { pending: string; running: string; success: string; error: string };
  carousel: {
    label: string;
    slide: (index: number, count: number) => string;
    previous: string;
    next: string;
    navigation: string;
    goTo: (index: number) => string;
  };
  steps: { label: string };
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
}

const zhComponents: ComponentLocale = {
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
  messageActions: {
    copy: "复制",
    copied: "已复制",
    regenerate: "重新生成",
    like: "赞",
    dislike: "踩",
  },
  thinkingBlock: { title: "思考过程" },
  toolCall: { pending: "等待", running: "运行中", success: "完成", error: "失败" },
  carousel: {
    label: "轮播",
    slide: (index, count) => `第 ${index} / ${count} 张`,
    previous: "上一张",
    next: "下一张",
    navigation: "幻灯片导航",
    goTo: (index) => `转到第 ${index} 张`,
  },
  steps: { label: "步骤" },
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
};

const enComponents: ComponentLocale = {
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
  messageActions: {
    copy: "Copy",
    copied: "Copied",
    regenerate: "Regenerate",
    like: "Like",
    dislike: "Dislike",
  },
  thinkingBlock: { title: "Thinking" },
  toolCall: { pending: "Pending", running: "Running", success: "Complete", error: "Failed" },
  carousel: {
    label: "Carousel",
    slide: (index, count) => `Slide ${index} of ${count}`,
    previous: "Previous slide",
    next: "Next slide",
    navigation: "Slide navigation",
    goTo: (index) => `Go to slide ${index}`,
  },
  steps: { label: "Steps" },
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
};

/** 默认中文（zh-CN）。各值与组件原硬编码逐字一致，保证未包 Provider 时行为不变。 */
export const zhCN: Locale = {
  components: zhComponents,
  table: {
    empty: "暂无数据",
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
