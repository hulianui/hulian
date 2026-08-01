import {
  DOCS_LOCALE,
  LOCALE_STORAGE_KEY,
  defaultLocaleForHost,
  switchLocaleUrl,
  type DocsLocale,
} from "./docs-locale";

const MAIN_HOST = "hulianui.haloritual.com";
const MIRROR_HOST = "hulianui-zh.haloritual.com";

const hostDefaults = {
  [MAIN_HOST]: defaultLocaleForHost(MAIN_HOST, null),
  [MIRROR_HOST]: defaultLocaleForHost(MIRROR_HOST, null),
} satisfies Record<string, DocsLocale>;

const localeRoots = {
  "zh-CN": switchLocaleUrl("/", "zh-CN"),
  en: switchLocaleUrl("/", "en"),
} satisfies Record<DocsLocale, string>;

/** Build the tiny synchronous bootstrap used before first paint. */
export function createLanguageInitScript(currentLocale: DocsLocale): string {
  const config = JSON.stringify({
    currentLocale,
    storageKey: LOCALE_STORAGE_KEY,
    hostDefaults,
    localeRoots,
  }).replace(/</g, "\\u003c");

  return `(function(c){try{var l=window.location,s=null;try{s=window.localStorage.getItem(c.storageKey)}catch(e){}var h=l.hostname.toLowerCase(),t=c.currentLocale;if(s==="zh-CN"||s==="en"){t=s}else if(Object.prototype.hasOwnProperty.call(c.hostDefaults,h)){t=c.hostDefaults[h]}if(t===c.currentLocale)return;var p=l.pathname;if(p==="/en"){p="/"}else if(p.indexOf("/en/")===0){p=p.slice(3)}if(t==="en"){p=c.localeRoots.en+(p==="/"?"":p)}var u=p+l.search+l.hash;if(u!==l.pathname+l.search+l.hash){l.replace(u)}}catch(e){}})(${config});`;
}

export const languageInitScript = createLanguageInitScript(DOCS_LOCALE);
