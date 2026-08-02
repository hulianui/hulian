import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    visualNodeOrchestration: "可视化节点编排",
    dragAndDropToSetUpBirthChartVideoPipeline: "拖拽连线即可搭出生图/视频流水线",
    multiModelFreeCombination: "多模型自由组合",
    promptWordsEnlargementStyleRedrawingCasualStitching: "提示词、放大、风格重绘随心拼接",
    oneClickVincentVideo: "一键文生视频",
    fromASentenceToAMovingPicture: "从一句话到一段动态画面",
    coral: "瑚",
    reefFlowStudio: "瑚琏 Flow Studio",
    puttingIdeas: "把创意",
    connectToAPipeline: "连成一条流水线",
    visualizeAndOrganizeAIRawDiagramsAndVideoWorkflowsPrompt:
      "可视化编排 AI 生图与视频工作流：提示词、模型、放大、图生视频，拖拽连线即可运行。",
    hulianBuiltInExamples: "© 2026 瑚琏 Hulian · 内置示例",
    logInToStartYourAICreationWorkflow: "登录开始你的 AI 创作工作流",
    forgotPassword: "忘记密码",
    applyForATrial: "申请试用",
    demoEnvironmentLogInWithAnyUsernamePassword: "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    visualNodeOrchestration: "Visual node orchestration",
    dragAndDropToSetUpBirthChartVideoPipeline: "Drag and drop to build image and video pipelines",
    multiModelFreeCombination: "Mix and match models",
    promptWordsEnlargementStyleRedrawingCasualStitching:
      "Connect prompts, upscaling, and style-transfer nodes as needed",
    oneClickVincentVideo: "One-click text to video",
    fromASentenceToAMovingPicture: "Turn one sentence into a moving image",
    coral: "H",
    reefFlowStudio: "Hulian Flow Studio",
    puttingIdeas: "Turn ideas",
    connectToAPipeline: "into pipelines",
    visualizeAndOrganizeAIRawDiagramsAndVideoWorkflowsPrompt:
      "Build AI image and video workflows visually. Connect prompts, models, upscalers, and image-to-video nodes, then run the pipeline.",
    hulianBuiltInExamples: "© 2026 Hulian · Built-in examples",
    logInToStartYourAICreationWorkflow: "Log in to start your AI creation workflow",
    forgotPassword: "Forgot password",
    applyForATrial: "Apply for a trial",
    demoEnvironmentLogInWithAnyUsernamePassword: "Demo environment: use any username and password",
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
  key: "demo-ai-workflow-login-page",
  content: t(content),
};

export default dictionary;
