import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    nodeLibrary: "节点库",
    buildYourBuildPipelineByDraggingInOrClickingOn:
      "从左侧节点库拖入或点击添加各类 AI 节点，构建你的生成流水线。",
    canvas: "画布",
    connectNodesOnCanvasDragFromTheDotOnThe:
      "在画布上连接节点：从节点右侧圆点拖向下一节点左侧圆点即可连线。滚轮平移，Ctrl+滚轮缩放。",
    runWorkflow: "运行工作流",
    afterConfiguringTheNodesClickRunAndTheAIWill:
      "配置好节点后点击「运行」，AI 会按拓扑顺序逐节点执行并生成产物。",
    unnamedWorkflow: "未命名工作流",
    nodeDeleted: "节点已删除",
    canvasCleared: "画布已清空",
    saved: "「{0}」已保存",
    runningStatusReset: "已重置运行状态",
    workflowName: "工作流名称",
    node: "节点",
    saveWorkflow: "保存工作流",
    save: "保存",
    saveCurrentWorkflow: "保存当前工作流",
    resetRunningState: "重置运行状态",
    reset: "重置",
    resetNodeRunningState: "重置节点运行状态",
    emptyCanvas: "清空画布",
    clear: "清空",
    emptyAllNodesOnCanvas: "清空画布上所有节点",
    generating: "生成中…",
    run: "运行",
    thisWillRemoveAllNodesAndConnectionsOnTheCanvas:
      "此操作将删除画布上所有节点与连线，且无法撤销。确认继续吗？",
    cancel: "取消",
    confirmEmpty: "确认清空",
    onboardingCompleteStartBuildingYourAIWorkflow: "引导完成，开始搭建你的 AI 工作流吧！",
  },
  en: {
    nodeLibrary: "Node library",
    buildYourBuildPipelineByDraggingInOrClickingOn:
      "Drag or click nodes in the library to build an AI generation workflow.",
    canvas: "Canvas",
    connectNodesOnCanvasDragFromTheDotOnThe:
      "Connect nodes by dragging from a node's right handle to the next node's left handle. Scroll to pan; use Ctrl + scroll to zoom.",
    runWorkflow: "Run workflow",
    afterConfiguringTheNodesClickRunAndTheAIWill:
      "After configuring the nodes, select Run. The workflow executes in topological order and produces its artifacts node by node.",
    unnamedWorkflow: "Unnamed workflow",
    nodeDeleted: "Node deleted",
    canvasCleared: "Canvas cleared",
    saved: 'Saved "{0}"',
    runningStatusReset: "Running status reset",
    workflowName: "Workflow name",
    node: "Node",
    saveWorkflow: "Save workflow",
    save: "Save",
    saveCurrentWorkflow: "Save current workflow",
    resetRunningState: "Reset run state",
    reset: "Reset",
    resetNodeRunningState: "Reset node running state",
    emptyCanvas: "Clear canvas",
    clear: "Clear",
    emptyAllNodesOnCanvas: "Remove every node from the canvas",
    generating: "Generating...",
    run: "Run",
    thisWillRemoveAllNodesAndConnectionsOnTheCanvas:
      "This removes every node and connection from the canvas and cannot be undone. Continue?",
    cancel: "Cancel",
    confirmEmpty: "Clear canvas",
    onboardingCompleteStartBuildingYourAIWorkflow: "You're ready to build your first AI workflow.",
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
  key: "demo-ai-workflow-app-page",
  content: t(content),
};

export default dictionary;
