// 演示素材（apps/www 的 public/demo/*）的路径前缀。
//
// showcase 里原先硬写 `/demo/avatar-1.jpg` 这样的**站点绝对路径**。文档站是双语双构建：
// 英文站挂根路径，中文站挂 `/zh`（next.config.mjs 的 basePath），而 public/ 下的资产跟着
// basePath 走 —— 于是中文站请求的 `/demo/avatar-1.jpg` 落在英文站的命名空间里。
// 线上两语言同域部署时它恰好还能取到（英文站占根），但那是巧合不是设计：`next dev` 起
// 中文站单站时这些图全 404，中文站若单独部署（桌面壳 / 镜像站只发一个语言）同样全断。
//
// 这里读构建期注入的 basePath 补上前缀。取值链路与 msw-provider 同源：
// next.config.mjs 的 `env: { NEXT_PUBLIC_DOCS_BASE_PATH }` 在服务端与客户端都给到同一个值，
// 因此 SSG 产出的 HTML 与 hydration 后的 DOM 一致，不会有 mismatch。
//
// 为什么不像 demoImage 那样内联成 data-URI：头像尚可（每张 3KB），但 photo-* 合计 240KB、
// sample-video.mp4 788KB、HLS 分片 436KB —— 这些会随 npm 包一起发出去（files: ["src"]）。
// 素材留在文档站、库里只管拼前缀，是唯一不给消费方增重的解法。
//
// declare 而不是给 packages/ui 加 @types/node，理由同 lib/is-dev.ts（源码分发，消费方 tsc
// 会把整棵 src 编进 program，库里任何一处裸 `process` 都会在浏览器端消费方那里炸掉）。
declare const process: { env: Record<string, string | undefined> } | undefined;

// 刻意写成完整成员表达式 `process.env.NEXT_PUBLIC_DOCS_BASE_PATH`：打包器（webpack
// DefinePlugin / turbopack / esbuild define）是按这条表达式做字面替换的，可选链形式未必命中。
const DOCS_BASE_PATH: string =
  typeof process !== "undefined" && !!process.env
    ? (process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? "")
    : "";

/**
 * 把演示素材的站点绝对路径补上文档站 basePath。
 *
 * 只给 showcase 用（演示素材本来就只存在于文档站）。组件运行时代码不要调它 ——
 * 消费方的 basePath 与本库无关，组件收到什么路径就用什么路径。
 *
 * @param path 以 `/demo/` 开头的站点绝对路径
 */
export function demoAsset(path: string): string {
  return `${DOCS_BASE_PATH}${path}`;
}
