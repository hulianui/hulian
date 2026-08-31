import type { ShowcaseSpec } from "../showcase/types";
import { Brand } from "./brand";

function Mark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 3.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" />
    </svg>
  );
}

// 动图示例用内联 SMIL SVG 的 data-URI 顶替真实 GIF：素材零外链（check-remote-assets），
// 又能在 <img> 里真的动起来。颜色是烘进素材里的——真实的品牌动图（GIF / WebM）也一样是
// 烘死的颜色，不会跟主题走，这正是它与 currentColor 图标 mark 的差别。
const MOTION_GLYPH = "<path d='M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Z'/>";
const MOTION_BG = "<rect width='24' height='24' fill='#1e293b'/>";
function motionSvg(animated: boolean) {
  const dot = animated
    ? "<circle cx='16.5' cy='16.5' r='3.5'><animate attributeName='r' values='3.5;1.5;3.5' dur='1.6s' repeatCount='indefinite'/></circle>"
    : "<circle cx='16.5' cy='16.5' r='3.5'/>";
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>${MOTION_BG}<g fill='#fff'>${MOTION_GLYPH}${dot}</g></svg>`,
  )}`;
}
const MOTION_MARK = motionSvg(true);
const STATIC_MARK = motionSvg(false);

export const brandShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "方角徽章 + 站点名。不传 mark 时自动取品牌名首字（中文一个字 / 英文首字母）。",
      code: `<Brand name="瑚琏后台" />
<Brand name="hulian admin" />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏后台" />
          <Brand name="hulian admin" />
        </div>
      ),
    },
    {
      title: "自定义徽章 · 副标题 · 配色",
      description: "mark 接图标/图片；description 挂一行版本或定位；color 换徽章底色。",
      code: `<Brand mark={<Logo />} name="瑚琏" description="v0.18.0" />
<Brand name="数据平台" color="chart-3" description="内部系统" />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="瑚琏" description="v0.18.0" />
          <Brand name="数据平台" color="chart-3" description="内部系统" />
        </div>
      ),
    },
    {
      title: "三档尺寸 · 收起态",
      description: "sm 导航栏 / md 侧栏 / lg 登录页品牌区；省略 name 只出徽章（侧栏收起时用）。",
      code: `<Brand size="sm" name="瑚琏" />
<Brand size="md" name="瑚琏" />
<Brand size="lg" name="瑚琏" />
<Brand mark={<Logo />} />   {/* 收起态 */}`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="瑚琏" />
          <Brand size="md" name="瑚琏" />
          <Brand size="lg" name="瑚琏" />
          <Brand mark={<Mark />} />
        </div>
      ),
    },
    {
      title: "动图徽章",
      description:
        "GIF / APNG / 动图 WebP 直接塞进 mark 就会动；包一层 <picture> 给开了「减弱动效」的用户一张静态图，两种写法都按铺满徽章处理。",
      code: `// 动图直接当 img 传；<picture> 给「减弱动效」用户一张静态回退
<Brand
  name="瑚琏后台"
  mark={
    <picture>
      <source srcSet="/brand-static.png" media="(prefers-reduced-motion: reduce)" />
      <img src="/brand-motion.gif" alt="" />
    </picture>
  }
/>
<Brand mark={<img src="/brand-motion.gif" alt="瑚琏后台" />} />   {/* 收起态 */}`,
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand
            name="瑚琏后台"
            description="picture 减弱动效回退"
            mark={
              <picture>
                <source srcSet={STATIC_MARK} media="(prefers-reduced-motion: reduce)" />
                <img src={MOTION_MARK} alt="" />
              </picture>
            }
          />
          <Brand mark={<img src={MOTION_MARK} alt="瑚琏后台" />} />
        </div>
      ),
    },
    {
      title: "链回首页",
      description: "href 走普通链接；render 接框架路由件（react-router / next/link），避免 SPA 整页刷新。",
      code: `<Brand name="瑚琏" href="/" />
<Brand name="瑚琏" render={<Link to="/" />} />`,
      render: () => (
        <div id="home" className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏" href="#home" />
          <Brand mark={<Mark />} name="瑚琏" description="点我回首页" href="#home" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["md", "sm", "lg"], defaultValue: "md" },
    { prop: "name", type: "text", defaultValue: "瑚琏后台" },
    { prop: "description", type: "text", defaultValue: "" },
    { prop: "color", type: "select", options: ["primary", "chart-2", "chart-3", "chart-5"], defaultValue: "primary" },
  ],
  states: [
    {
      name: "默认（首字徽章）",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand name="瑚琏后台" />
          <Brand name="hulian admin" />
        </div>
      ),
    },
    {
      name: "自定义徽章 + 副标题",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand mark={<Mark />} name="瑚琏" description="v0.18.0" />
          <Brand name="数据平台" color="chart-3" description="内部系统" />
        </div>
      ),
    },
    {
      name: "三档尺寸 + 收起态",
      render: () => (
        <div className="flex flex-wrap items-center gap-8">
          <Brand size="sm" name="瑚琏" />
          <Brand size="md" name="瑚琏" />
          <Brand size="lg" name="瑚琏" />
          <Brand mark={<Mark />} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Brand
      name={(p.name as string) || undefined}
      description={(p.description as string) || undefined}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      color={(p.color as string) ?? "primary"}
    />
  ),
  toCode: (p) =>
    `<Brand\n  name="${p.name ?? "瑚琏后台"}"${p.description ? `\n  description="${p.description}"` : ""}${
      p.size && p.size !== "md" ? `\n  size="${p.size}"` : ""
    }${p.color && p.color !== "primary" ? `\n  color="${p.color}"` : ""}\n/>`,
};
