import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { Book3DProps } from "./book-3d.types";

const ribbonToneClass: Record<NonNullable<Book3DProps["ribbonTone"]>, string> = {
  brand: "bg-primary text-bg",
  danger: "bg-[#d9482b] text-white",
  success: "bg-[#1f9d6b] text-white",
};

/**
 * 3D 立体书 —— CSS 3D transform 透视书体（前封 + 书脊 + 右侧页块 + 后封）。
 * 静止 rotateY(-25deg) 露出厚度，hover 转正；纯 transform（GPU 合成），
 * prefers-reduced-motion 降级为无过渡。href→<a> / onClick→<button> / 否则 <div>。
 */
export function Book3D({
  title,
  subtitle,
  cover,
  logo,
  coverColor = { from: "var(--color-primary)", to: "color-mix(in oklab, var(--color-primary) 60%, #000)" },
  spineColor = "#efe9dd",
  thickness = "2.25rem",
  ribbon,
  ribbonTone = "danger",
  href,
  onClick,
  target,
  inside,
  className,
}: Book3DProps) {
  const coverStyle: CSSProperties = cover
    ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: `linear-gradient(135deg, ${coverColor.from}, ${coverColor.to})` };

  const vars = { "--book-thk": thickness, "--book-spine": spineColor } as CSSProperties;
  const openable = inside != null;

  const body = (
    <span
      className={cn(
        "group relative block aspect-[3/4] w-44 shrink-0 select-none [perspective:1400px]",
        className,
      )}
      style={vars}
    >
      <span
        className={cn(
          "relative block h-full w-full [transform-style:preserve-3d] [transform:rotateY(-25deg)] transition-transform duration-700 ease-out motion-reduce:transition-none",
          // 翻开模式：hover 仅把书微微转正，主体动作交给前封绕书脊翻开露内页；否则整本转正。
          openable ? "group-hover:[transform:rotateY(-16deg)]" : "group-hover:[transform:rotateY(0deg)]",
        )}
      >
        {/* 右侧页块（纸张厚度）：绕右缘旋 90° 后须再 translateZ(-thk/2)，
            使其在 z 轴落到 [-thk/2,+thk/2]，正好衔接前封(+thk/2)与后封(-thk/2)；
            否则枢轴停在 z=0 → 页块整体朝观察者凸出 thk/2，盖住封面右缘。 */}
        <span
          aria-hidden
          className="absolute right-0 top-[3px] bottom-[3px] origin-right [width:var(--book-thk)] [transform:translateZ(calc(var(--book-thk)/-2))_rotateY(90deg)] [background:repeating-linear-gradient(90deg,var(--book-spine),var(--book-spine)_1px,color-mix(in_oklab,var(--book-spine)_82%,#000)_2px,var(--book-spine)_3px)]"
        />
        {/* 左侧书脊：同理 translateZ(-thk/2) 居中，避免书脊朝观察者凸出 */}
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full origin-left [width:var(--book-thk)] [transform:translateZ(calc(var(--book-thk)/-2))_rotateY(-90deg)] [background:linear-gradient(90deg,rgba(0,0,0,.32),rgba(0,0,0,.08))]"
        />
        {/* 后封：非翻开模式是深色书底。翻开模式改【透明】——理由有二：
            1) 深色会让内页淡入呈灰（白叠黑）；改白又会被 preserve-3d 排序 bug 渗到封面左缘成白条。
            2) 透明在闭合态即使被渗透也不可见；内页淡入时白叠透出的是书后的浅色页面底（白叠浅=浅，不发灰）；
               全开态被不透明内页完全盖住。两个窗口都无副作用。 */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-r-[3px] rounded-l-sm [transform:translateZ(calc(var(--book-thk)/-2))]",
            openable ? "bg-transparent" : "bg-foreground/80",
          )}
        />
        {/* 内页（翻开模式）：白纸印产品理念，被前封盖住，hover 前封翻开后露出。
            内页(z=thk/2-2px)与前封(z=thk/2)是近平行面，Chromium 对 preserve-3d 嵌套的近平行面
            合成排序有 bug：静止态内页会在封面左缘约 1/4 区域反盖到封面上（与 z 间距、DOM 顺序均无关，
            12px 间距仍复现）。故【不靠 z 序藏内页】，改用 opacity 门控。
            但门控必须【非对称时序】，否则翻开/关闭途中内页缺席会露出深色后封(bg-foreground/80)：
            · 打开：delay 80ms（封面已裂到约 -17°、与内页不再共面）后快速淡入 → 避开左缘穿帮，又几乎不露后封；
            · 关闭：delay 620ms（封面已合回约 -17°）才淡出 → 全程挡住后封，仅在贴近闭合时消失避穿帮。
            两端 delay 都落在「封面离闭合约 17°」处，穿帮与黑页两个窗口都被夹掉。 */}
        {openable && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-r-[3px] rounded-l-sm bg-surface px-5 text-center text-foreground opacity-0 transition-opacity duration-[80ms] delay-[620ms] group-hover:opacity-100 group-hover:duration-[120ms] group-hover:delay-[80ms] motion-reduce:transition-none [transform:translateZ(calc(var(--book-thk)/2_-_2px))]">
            {inside}
          </span>
        )}
        {/* 前封：翻开模式下是绕左缘(书脊)开门的【双面】封面——正面封面图、背面浅色内衬纸；
            翻开后内衬朝外＝左侧翻起的封面页，右侧露出内页。非翻开模式即普通单面封面。 */}
        <span
          className={cn(
            "absolute inset-0 [transform:translateZ(calc(var(--book-thk)/2))]",
            openable &&
              "[transform-style:preserve-3d] origin-left transition-transform duration-700 ease-out group-hover:[transform:translateZ(calc(var(--book-thk)/2))_rotateY(-150deg)] motion-reduce:transition-none",
          )}
        >
          {/* 封面正面 */}
          <span
            className={cn(
              "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-r-[3px] rounded-l-sm p-4 text-white shadow-[0_22px_40px_-18px_rgba(0,0,0,.55)]",
              openable && "[backface-visibility:hidden]",
            )}
            style={coverStyle}
          >
            {/* 封脊高光：左侧装订暗带 */}
            <span aria-hidden className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/30 to-transparent" />
            {/* 角标缎带：贴封面右上，随封面一起翻开（不再独立悬空穿帮） */}
            {ribbon && (
              <span className="pointer-events-none absolute -right-px top-[6px] z-10" aria-hidden>
                <span
                  className={cn(
                    "block px-3 py-0.5 text-[11px] font-bold tracking-wide shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,8px_100%)]",
                    ribbonToneClass[ribbonTone],
                  )}
                >
                  {ribbon}
                </span>
              </span>
            )}
            {logo ? (
              <>
                {/* 产品 logo / app icon 居中，标题落到封底 */}
                <span className="flex flex-1 items-center justify-center py-3">
                  <img
                    src={logo}
                    alt=""
                    className="aspect-square w-[46%] rounded-[22%] object-cover shadow-[0_10px_24px_-8px_rgba(0,0,0,.6)] ring-1 ring-white/15"
                  />
                </span>
                <span className="relative">
                  <span className="block text-[1.35rem] font-bold leading-tight tracking-tight drop-shadow">{title}</span>
                  {subtitle != null && (
                    <span className="mt-0.5 block text-xs font-medium uppercase tracking-widest text-white/80">{subtitle}</span>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="relative text-[1.6rem] font-bold leading-tight tracking-tight drop-shadow">{title}</span>
                {subtitle != null && (
                  <span className="relative text-sm font-medium uppercase tracking-widest text-white/85">{subtitle}</span>
                )}
              </>
            )}
          </span>
          {/* 封面背面内衬（翻开后朝外＝左侧翻起封面的内侧纸） */}
          {openable && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-r-[3px] rounded-l-sm bg-surface [transform:rotateY(180deg)] [backface-visibility:hidden]"
            >
              {/* 装订侧内阴影（翻开后位于右缘＝书脊一侧，模拟衬纸贴脊的暗角） */}
              <span aria-hidden className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/12 to-transparent" />
            </span>
          )}
        </span>
        {/* 角标缎带已并入封面正面（随封面翻开），此处不再独立渲染以免穿帮 */}
      </span>
    </span>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noreferrer" : undefined} className="inline-block">
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="inline-block bg-transparent p-0">
        {body}
      </button>
    );
  }
  return body;
}
