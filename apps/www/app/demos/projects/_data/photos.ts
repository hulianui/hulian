import type { Photo, PhotoTag, ProjectStage } from "./types";

// 工作照片 mock：覆盖多项目/阶段/标签，ratio 不等高喂瀑布流。
// 占位图由 photoArt() 程序化生成（data-URI SVG，离线零素材），按 tag 配色 + 文案，语义贴合施工照片。

interface Seed {
  projectId: string;
  projectName: string;
  stage: ProjectStage;
  tag: PhotoTag;
  caption: string;
  uploader: string;
  takenAt: string;
  ratio: number; // 高/宽，<1 横图 >1 竖图
}

const seeds: Seed[] = [
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "施工", tag: "进度", caption: "冷冻机房主管道安装", uploader: "鸿基机电班组", takenAt: "2026-06-03 14:20", ratio: 0.7 },
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "施工", tag: "进度", caption: "桥架敷设完成验收", uploader: "鸿基机电班组", takenAt: "2026-06-03 14:22", ratio: 1.3 },
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "施工", tag: "材料", caption: "YJV 电缆进场点验", uploader: "陈工", takenAt: "2026-05-28 09:10", ratio: 0.75 },
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "进场", tag: "进度", caption: "配电柜就位", uploader: "鸿基机电班组", takenAt: "2026-05-12 16:40", ratio: 1.0 },
  { projectId: "p2", projectName: "瑞康制药 GMP 洁净车间", stage: "验收", tag: "验收", caption: "高效送风口洁净度检测", uploader: "金顶装饰队", takenAt: "2026-05-28 13:20", ratio: 0.8 },
  { projectId: "p2", projectName: "瑞康制药 GMP 洁净车间", stage: "验收", tag: "验收", caption: "彩钢板隔墙阴角处理", uploader: "金顶装饰队", takenAt: "2026-05-28 13:25", ratio: 1.4 },
  { projectId: "p2", projectName: "瑞康制药 GMP 洁净车间", stage: "施工", tag: "进度", caption: "环氧自流平地面施工", uploader: "周磊", takenAt: "2026-05-10 10:00", ratio: 0.65 },
  { projectId: "p2", projectName: "瑞康制药 GMP 洁净车间", stage: "施工", tag: "隐患", caption: "传递窗密封待整改", uploader: "周磊", takenAt: "2026-05-15 11:30", ratio: 1.0 },
  { projectId: "p3", projectName: "极光新能源充电站", stage: "施工", tag: "进度", caption: "直流充电桩基础浇筑", uploader: "恒通安装队", takenAt: "2026-05-22 08:50", ratio: 0.9 },
  { projectId: "p3", projectName: "极光新能源充电站", stage: "施工", tag: "隐患", caption: "配电箱接地待整改", uploader: "高敏", takenAt: "2026-06-03 10:05", ratio: 1.25 },
  { projectId: "p3", projectName: "极光新能源充电站", stage: "进场", tag: "材料", caption: "箱式变电站吊装就位", uploader: "恒通安装队", takenAt: "2026-04-18 15:00", ratio: 0.7 },
  { projectId: "p4", projectName: "晨光商业综合体暖通", stage: "进场", tag: "进度", caption: "VRV 室外机分批进场", uploader: "远大暖通队", takenAt: "2026-05-09 08:40", ratio: 1.0 },
  { projectId: "p4", projectName: "晨光商业综合体暖通", stage: "进场", tag: "材料", caption: "镀锌风管预制加工", uploader: "苏建国", takenAt: "2026-05-14 14:10", ratio: 1.35 },
  { projectId: "p4", projectName: "晨光商业综合体暖通", stage: "进场", tag: "进度", caption: "冷媒铜管支架安装", uploader: "远大暖通队", takenAt: "2026-05-20 09:30", ratio: 0.75 },
  { projectId: "p6", projectName: "绿野农业冷链仓储", stage: "结算", tag: "验收", caption: "冷库制冷机组竣工照", uploader: "远大暖通队", takenAt: "2026-04-25 16:00", ratio: 0.8 },
  { projectId: "p6", projectName: "绿野农业冷链仓储", stage: "验收", tag: "验收", caption: "库温降温曲线测试", uploader: "陈工", takenAt: "2026-04-20 11:00", ratio: 1.2 },
  { projectId: "p7", projectName: "和裕酒店中央空调改造", stage: "结算", tag: "验收", caption: "客房风机盘管更换完成", uploader: "远大暖通队", takenAt: "2026-03-08 10:20", ratio: 0.9 },
  { projectId: "p7", projectName: "和裕酒店中央空调改造", stage: "施工", tag: "进度", caption: "冷却塔基础加固", uploader: "周磊", takenAt: "2026-02-12 14:30", ratio: 1.1 },
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "施工", tag: "进度", caption: "母线槽水平安装", uploader: "鸿基机电班组", takenAt: "2026-06-01 09:10", ratio: 0.6 },
  { projectId: "p1", projectName: "云栖数据中心机电安装", stage: "施工", tag: "验收", caption: "接地电阻测试记录", uploader: "陈工", takenAt: "2026-06-02 15:40", ratio: 1.5 },
  { projectId: "p2", projectName: "瑞康制药 GMP 洁净车间", stage: "验收", tag: "进度", caption: "净化空调系统调试", uploader: "金顶装饰队", takenAt: "2026-05-30 10:50", ratio: 0.85 },
  { projectId: "p3", projectName: "极光新能源充电站", stage: "施工", tag: "进度", caption: "电缆桥架跨接线", uploader: "恒通安装队", takenAt: "2026-05-29 16:20", ratio: 1.0 },
  { projectId: "p4", projectName: "晨光商业综合体暖通", stage: "进场", tag: "隐患", caption: "管井防火封堵待补", uploader: "苏建国", takenAt: "2026-05-22 11:15", ratio: 0.95 },
  { projectId: "p6", projectName: "绿野农业冷链仓储", stage: "结算", tag: "材料", caption: "聚氨酯冷库板进场", uploader: "远大暖通队", takenAt: "2026-02-08 09:00", ratio: 1.3 },
];

// 工作照片占位图：程序化生成 data-URI SVG，离线零素材、SSR/CSR 确定性一致。
// 按 tag 配色（进度=蓝 / 材料=琥珀 / 验收=绿 / 隐患=红）+ 蓝图网格纹理 + 居中文案，
// 让占位图语义贴合施工照片，而非外链随机图（避免"电缆点验配城市夜景"的违和）。
const TAG_HUE: Record<PhotoTag, number> = { 进度: 210, 材料: 35, 验收: 150, 隐患: 8 };

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function photoArt(s: Seed, w: number, h: number): string {
  const hue = TAG_HUE[s.tag];
  const fontSize = Math.max(26, Math.min(40, Math.round(w / Math.max(7, s.caption.length))));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 52% 46%)"/>
      <stop offset="1" stop-color="hsl(${hue} 58% 26%)"/>
    </linearGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <circle cx="${(w * 0.82).toFixed(0)}" cy="${(h * 0.2).toFixed(0)}" r="${(w * 0.26).toFixed(0)}" fill="rgba(255,255,255,0.06)"/>
  <rect x="${(w * 0.5 - 22).toFixed(0)}" y="${(h * 0.5 - 78).toFixed(0)}" width="44" height="32" rx="4" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="3"/>
  <circle cx="${(w * 0.5).toFixed(0)}" cy="${(h * 0.5 - 62).toFixed(0)}" r="9" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="3"/>
  <text x="50%" y="52%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="600" fill="#fff">${xmlEscape(s.caption)}</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="20" fill="rgba(255,255,255,0.78)">${xmlEscape(s.projectName)} · ${s.stage}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const photos: Photo[] = seeds.map((s, i) => {
  const w = 800;
  const h = Math.round(w * s.ratio);
  return {
    id: `ph${i + 1}`,
    projectId: s.projectId,
    projectName: s.projectName,
    stage: s.stage,
    tag: s.tag,
    caption: s.caption,
    uploader: s.uploader,
    takenAt: s.takenAt,
    ratio: s.ratio,
    src: photoArt(s, w, h),
  };
});

export const PHOTO_TAGS: PhotoTag[] = ["进度", "材料", "验收", "隐患"];

export function photosByProject(projectId: string): Photo[] {
  return photos.filter((p) => p.projectId === projectId);
}
