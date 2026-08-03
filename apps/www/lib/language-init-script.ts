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

export const languageInitScript = createLanguageInitScript(DOCS_LOCALE);
