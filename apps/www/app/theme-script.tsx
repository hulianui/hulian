// anti-FOUC inline script —— 归 www（Next 专属 FOUC 问题），不塞进框架无关库。
// 在 hydration 前根据 localStorage / 系统偏好定 data-theme，消灭首屏白闪。
export const themeScript = `(function(){try{var s=localStorage.getItem('hulian-theme')||'system';var d=s==='dark'||(s==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;
