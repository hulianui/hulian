import {
  DOCS_LOCALE,
  LOCALE_STORAGE_KEY,
  NESTED_BASE_PATH,
  NESTED_LOCALE,
  type DocsLocale,
} from "./docs-locale";

/**
 * 首屏同步执行的语言引导脚本。
 *
 * 只在用户**显式切换过**语言（localStorage 里有记录）时才跳转。没有记录一律留在当前 URL。
 *
 * 为什么不能按域名/浏览器语言自动跳：搜索引擎渲染 JS 时同样没有 localStorage，一旦按默认值
 * 跳转，爬虫就会把站内每个 URL 判成「带重定向的网页」并从索引移除 —— sitemap 里提交的全部
 * 地址会集体失效。想让两个语种都被收录，首访就必须零跳转。
 */
export function createLanguageInitScript(currentLocale: DocsLocale): string {
  const config = JSON.stringify({
    currentLocale,
    storageKey: LOCALE_STORAGE_KEY,
    nestedBasePath: NESTED_BASE_PATH,
    nestedLocale: NESTED_LOCALE,
  }).replace(/</g, "\\u003c");

  return `(function(c){try{var l=window.location,s=null;try{s=window.localStorage.getItem(c.storageKey)}catch(e){}if(s!=="zh-CN"&&s!=="en")return;if(s===c.currentLocale)return;var n=c.nestedBasePath,p=l.pathname;if(p===n||p===n+"/"){p="/"}else if(p.indexOf(n+"/")===0){p=p.slice(n.length)}if(s===c.nestedLocale){p=p==="/"?n+"/":n+p}var u=p+l.search+l.hash;if(u!==l.pathname+l.search+l.hash){l.replace(u)}}catch(e){}})(${config});`;
}

/**
 * dev 下不注入。
 *
 * `next dev` 只构建一种语言（双语是 scripts/build-bilingual-docs.mjs 跑两遍 `next build`
 * 的产物），而这段脚本会把「偏好语言 ≠ 当前构建语言」的访问者 replace 到另一种语言的 URL。
 * 在 dev 上那个 URL 根本不存在 —— 于是点任何站内链接都会被弹进 404，且 404 页的站内链接
 * （本身是当前语言前缀）一加载又触发同样的改写，看起来就像页面在不停刷新。
 *
 * 生产构建保持原行为：偏好语言优先，双语站里目标 URL 真实存在。
 */
export const languageInitScript =
  process.env.NODE_ENV === "development" ? "" : createLanguageInitScript(DOCS_LOCALE);
