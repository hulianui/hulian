"use client";
import { createContext, useContext } from "react";

/**
 * 组件内置文案的 i18n 字典。当前覆盖企业层 ProTable / AdminLayout 的可见文案；
 * 后续组件接入 i18n 时在此扩展（原子件文案为渐进迁移项，见 docs/enterprise-roadmap.md）。
 */
export interface Locale {
  table: {
    /** 空态默认标题（emptyText 未传时使用）。 */
    empty: string;
  };
  proTable: {
    /** 底部总条数文案（参数化）。 */
    total: (count: number) => string;
    reload: string;
    density: string;
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

/** 默认中文（zh-CN）。各值与组件原硬编码逐字一致，保证未包 Provider 时行为不变。 */
export const zhCN: Locale = {
  table: {
    empty: "暂无数据",
  },
  proTable: {
    total: (n) => `共 ${n} 条`,
    reload: "刷新",
    density: "密度",
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
  table: {
    empty: "No data",
  },
  proTable: {
    total: (n) => `${n} items`,
    reload: "Refresh",
    density: "Density",
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
