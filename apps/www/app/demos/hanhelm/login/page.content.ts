import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "sixDimensionalIntelligentRouting": "六维智能路由",
    "scoreByCapabilityCostLatencyLoadPriority": "按能力 + 成本 + 延迟 + 负载 + 优先级 + SLA 打分，把任务派给最优执行器",
    "multiAgentOrchestrationDeClassification": "多 agent 编排 + 降级",
    "complexTasksAreBrokenDownIntoSubtask": "复杂任务分解为子任务 DAG，执行器失败自动 failover 到降级链",
    "fullLinkSlaIsObservable": "全链路 SLA 可观测",
    "queueDepthLoadP50P95LatencyPer": "队列深度、负载、P50/P95 延迟、逐任务成本，每一次调度都算得清",
    "rudder": "舵",
    "hanhelmHanhelm": "瀚舵 HanHelm",
    "agents": "智能体",
    "taskSchedulingPlatform": "任务调度平台",
    "heterogeneousAiTasksFloodTheTaskBus": "异构 AI 任务涌入任务总线，智能路由按六维打分派给 agent/模型池，多 agent 编排 + 降级 failover + 全链路可观测。",
    "hanhelmHanhelmBuiltInExamples": "© 2026 瀚舵 HanHelm · 内置示例",
    "rudder2": "舵",
    "hanhelmHanhelm2": "瀚舵 HanHelm",
    "logInToTheDispatchConsole": "登录调度控制台",
    "forgotThePassword": "忘记密码",
    "applyForAccess": "申请接入",
    "demoEnvironmentLogInByEnteringAny": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "sixDimensionalIntelligentRouting": "Six-dimensional intelligent routing",
    "scoreByCapabilityCostLatencyLoadPriority": "Score by capability + cost + latency + load + priority + SLA, assigning tasks to the best-fit executor",
    "multiAgentOrchestrationDeClassification": "Multi-agent orchestration and fallback",
    "complexTasksAreBrokenDownIntoSubtask": "Complex jobs become subtask DAGs; failed executors automatically move to the configured fallback chain.",
    "fullLinkSlaIsObservable": "End-to-end SLA is observable",
    "queueDepthLoadP50P95LatencyPer": "Track queue depth, load, P50/P95 latency, and cost for every scheduling decision",
    "rudder": "Rudder",
    "hanhelmHanhelm": "HanHelm",
    "agents": "Agents",
    "taskSchedulingPlatform": "Task scheduling platform",
    "heterogeneousAiTasksFloodTheTaskBus": "HanHelm routes mixed AI workloads across agent and model pools, orchestrates multi-agent jobs, applies fallbacks, and exposes end-to-end telemetry.",
    "hanhelmHanhelmBuiltInExamples": "© 2026 HanHelm · Built-in example",
    "rudder2": "Rudder",
    "hanhelmHanhelm2": "HanHelm",
    "logInToTheDispatchConsole": "Sign in to the dispatch console",
    "forgotThePassword": "Forgot the password",
    "applyForAccess": "Apply for access",
    "demoEnvironmentLogInByEnteringAny": "Demo environment: Log in by entering any username or password",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanhelm-login-page",
  content: t(content),
};

export default dictionary;
