import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    exportFigures: "导出图表",
    exportTitle: "逐步导出 SVG",
    exportDescription:
      "每张图的每一步各导出一份矢量图：颜色写成十六进制，文字保留为可编辑的文本，可直接插入 Word 或转成 PDF 放进 LaTeX。",
    exportOverview: "全部",
    exportDone: "已导出 {0}",
    exportFailed: "导出失败",
    exportPreview: "最近一次导出",
    exportSize: "{0} KB，以 img 载入，已不依赖页面样式",
    figureLabel: "图 {0}",
  },
  en: {
    exportFigures: "Export figures",
    exportTitle: "Export SVG per step",
    exportDescription:
      "Each step of each figure becomes its own vector file: colors are written as hex and text stays editable, ready for Word or for conversion to PDF in LaTeX.",
    exportOverview: "All",
    exportDone: "Exported {0}",
    exportFailed: "Export failed",
    exportPreview: "Latest export",
    exportSize: "{0} KB, loaded as an img without the page styles",
    figureLabel: "Figure {0}",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanpaper-components-figure-export",
  content: t(content),
};

export default dictionary;
