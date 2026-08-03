import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    "connectToGitAndDeployAutomatically": "连 Git 即自动部署",
    "pushToProductionBranchToBuildAutomatically": "推送到生产分支自动构建，每个 PR 一个独立预览域名",
    "buildAndObserve": "构建即可观测",
    "buildLogsInRealTimeTakeTime": "实时构建日志、分步耗时、一键回滚到任意历史版本",
    "edgeNetworkFreeTls": "边缘网络 + 免费 TLS",
    "globalNodeDistributionCustomDomainNameAutomatic": "全球 310 节点分发，自定义域名自动签发并续期证书",
    "ship": "舰",
    "hanship": "瀚舰 HanShip",
    "pushFromGit": "从 git push",
    "goOnlineGlobally": "到全球上线",
    "connectToTheWarehouseAutomaticallyBuildPreview": "连接仓库、自动构建、预览部署、边缘分发 —— 把每一次提交都变成一个可回滚的线上版本。",
    "hanshipBuiltInExamples": "© 2026 瀚舰 HanShip · 内置示例",
    "ship2": "舰",
    "hanship2": "瀚舰 HanShip",
    "logInToTheDeploymentConsole": "登录部署控制台",
    "forgotPassword": "忘记密码",
    "signInWithGithub": "用 GitHub 登录",
    "demoEnvironmentFillInAnyUsernamePassword": "演示环境：用户名 / 密码任意填写即可登录",
  },
  en: {
    "connectToGitAndDeployAutomatically": "Connect to Git and deploy automatically",
    "pushToProductionBranchToBuildAutomatically": "Push to production branch to build automatically, each PR has an independent preview domain name",
    "buildAndObserve": "Build and observe",
    "buildLogsInRealTimeTakeTime": "Build logs in real time, take time step by step, and roll back to any historical version with one click",
    "edgeNetworkFreeTls": "Edge Network + Free TLS",
    "globalNodeDistributionCustomDomainNameAutomatic": "Global 310 node distribution, custom domain name automatic issuance and renewal of certificates",
    "ship": "ship",
    "hanship": "HanShip",
    "pushFromGit": "push from git",
    "goOnlineGlobally": "Deploy globally",
    "connectToTheWarehouseAutomaticallyBuildPreview": "Connect to the repository, automatically build, preview deployment, edge distribution - turn every commit into a rollback-ready deployment.",
    "hanshipBuiltInExamples": "© 2026 HanShip · Built-in examples",
    "ship2": "ship",
    "hanship2": "HanShip",
    "logInToTheDeploymentConsole": "Log in to the deployment console",
    "forgotPassword": "Forgot password",
    "signInWithGithub": "Sign in with GitHub",
    "demoEnvironmentFillInAnyUsernamePassword": "Demo environment: fill in any username/password to log in",
  },
} as const;

export type ContentKey = keyof typeof content["zh-CN"];

export function copy(key: ContentKey, ...values: readonly unknown[]): string {
  return values.reduce<string>((text, value, index) => text.replaceAll(`{${index}}`, String(value)), content[DOCS_LOCALE][key]);
}

const dictionary: Dictionary = {
  key: "demo-hanship-login-page",
  content: t(content),
};

export default dictionary;
