import type { DeployState } from "@hulianui/ui";

// 复用库的部署生命周期态语义（dogfood：demo 与组件同一套 DeployState）。
export type { DeployState };

export type Environment = "production" | "preview";

export type Framework =
  | "Next.js"
  | "Vite"
  | "Astro"
  | "Nuxt"
  | "Remix"
  | "静态站点";

export interface Project {
  id: string;
  name: string;
  /** 部署子域前缀（<slug>.hanship.dev）。 */
  slug: string;
  framework: Framework;
  /** git 仓库 org/repo。 */
  repo: string;
  productionBranch: string;
  /** 生产域名（自定义域优先，否则 <slug>.hanship.dev）。 */
  prodUrl: string;
  /** 绑定的自定义域名数。 */
  domainCount: number;
  autoDeploy: boolean;
  /** 当前生产部署 id。 */
  currentDeployId: string;
  createdAgoDays: number;
}

export interface Deploy {
  id: string;
  projectId: string;
  env: Environment;
  branch: string;
  sha: string;
  message: string;
  author: string;
  /** 头像首字。 */
  authorInitial: string;
  status: DeployState;
  /** 部署专属预览 URL（<hash>.<slug>.hanship.dev）。 */
  url: string;
  /** 距今分钟数（渲染时换算 RelativeTime，保证永远新鲜）。 */
  agoMin: number;
  /** 构建耗时（秒）；构建中/排队为 null。 */
  durationSec: number | null;
  /** 是否当前生产版本。 */
  current?: boolean;
}

export interface BuildStep {
  id: string;
  name: string;
  status: DeployState;
  durationSec: number | null;
}

export interface LogLine {
  /** 自构建开始的相对秒（渲染成 mm:ss）。 */
  at: number;
  level: "info" | "warn" | "error" | "success" | "debug";
  message: string;
}

export interface Domain {
  id: string;
  projectId: string;
  host: string;
  type: "primary" | "redirect" | "preview";
  ssl: "active" | "pending" | "error";
  dns: "valid" | "pending" | "misconfigured";
  addedAgoDays: number;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  targets: Environment[];
  secret: boolean;
  updatedAgoDays: number;
}
