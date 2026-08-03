import { t, type Dictionary } from "intlayer";

export const installPanelContent = {
  "zh-CN": {
    title: "安装与接入",
    sourcePrefix: "数据来自本站 registry v",
    sourceSuffix: "，与 shadcn CLI 实际拉取的是同一份。",
    recursive: "递归安装",
    blocksCount: "{count} 个区块",
    recursivePrefix: "CLI 会先把这些区块写进你的工程，再写入本",
    page: "页",
    block: "区块",
    recursiveSuffix: "源码。",
    files: "写入文件",
    count: "{count} 个",
    providers: "需要 Provider",
    noneProviders: "无 —— 不依赖任何 Provider。",
    replace: "必须替换",
    replaceHint: "接入前逐项处理",
    noneReplace: "无 —— 源码里没有需要替换的示例内容。",
    slots: "可替换插槽",
    npm: "npm 依赖",
    noneNpm: "无额外依赖。",
    verify: "装完验一遍",
    verifyDescription: "门禁按 conventions 的可执行规则扫描目标文件；错误级违规会以非零状态退出。",
  },
  en: {
    title: "Install and integrate",
    sourcePrefix: "Data comes from this site's registry v",
    sourceSuffix: ", the same source consumed by the shadcn CLI.",
    recursive: "Recursive install",
    blocksCount: "{count} blocks",
    recursivePrefix: "The CLI writes these blocks into your project before writing the source for this ",
    page: "page",
    block: "block",
    recursiveSuffix: ".",
    files: "Files written",
    count: "{count} files",
    providers: "Required providers",
    noneProviders: "None. This item does not require a provider.",
    replace: "Required replacements",
    replaceHint: "Complete each item before integration",
    noneReplace: "None. The source contains no sample content that must be replaced.",
    slots: "Replaceable slots",
    npm: "npm dependencies",
    noneNpm: "No additional dependencies.",
    verify: "Verify the installation",
    verifyDescription: "The guard checks these target files against executable convention rules and exits non-zero for error-level violations.",
  },
} as const;

const dictionary: Dictionary = {
  key: "install-panel",
  content: t(installPanelContent),
};

export default dictionary;
