import type { Artifact } from "./types";

// mock 历史产物（产物画廊）。图用程序化渐变 seed，视频复用 public/demo 下的样例资源。
export const ARTIFACTS: Artifact[] = [
  { id: "a1", type: "image", title: "霓虹机械猫", seed: 480231, model: "flux-hl", ratio: "1:1", workflow: "文生图 · 高清放大", createdAt: "2 分钟前", prompt: "一只机械猫坐在霓虹小巷，雨夜，电影感光影" },
  { id: "a2", type: "image", title: "晨雾山湖", seed: 240118, model: "huapro-xl", ratio: "16:9", workflow: "文生图 · 基础", createdAt: "11 分钟前", prompt: "晨雾中的山间湖泊，写实风光，柔和晨光" },
  { id: "a3", type: "video", title: "星空鲸鱼", videoUrl: "/demo/sample-video.mp4", poster: "/demo/sample-poster.jpg", model: "huapro-xl", ratio: "16:9", workflow: "文生视频", createdAt: "26 分钟前", prompt: "鲸鱼在星空中游弋，梦幻，慢镜头" },
  { id: "a4", type: "image", title: "未来天际线", seed: 771203, model: "flux-hl", ratio: "16:9", workflow: "文生图 · 高清放大", createdAt: "32 分钟前", prompt: "未来城市天际线，黄昏，超广角，海报" },
  { id: "a5", type: "image", title: "水彩少女", seed: 558014, model: "yunhui-anime3", ratio: "1:1", workflow: "图生图 · 风格重绘", createdAt: "48 分钟前", prompt: "保留构图，转为水彩插画风" },
  { id: "a6", type: "image", title: "国风庭院", seed: 661820, model: "huapro-xl", ratio: "4:3", workflow: "文生图 · 基础", createdAt: "1 小时前", prompt: "江南庭院，水墨国风，飞檐翘角" },
  { id: "a7", type: "image", title: "赛博街市", seed: 119537, model: "flux-hl", ratio: "9:16", workflow: "文生图 · 基础", createdAt: "1 小时前", prompt: "赛博朋克夜市，雨，霓虹招牌，竖构图" },
  { id: "a8", type: "video", title: "流动星河", videoUrl: "/demo/sample-video.mp4", poster: "/demo/sample-poster.jpg", model: "huapro-xl", ratio: "16:9", workflow: "图生视频", createdAt: "2 小时前", prompt: "上传一张图，直接让它动起来" },
  { id: "a9", type: "image", title: "极简产品图", seed: 903412, model: "realvis-5", ratio: "1:1", workflow: "文生图 · 基础", createdAt: "3 小时前", prompt: "极简白底产品摄影，柔光，高质感" },
  { id: "a10", type: "image", title: "胶片人像", seed: 330921, model: "realvis-5", ratio: "4:3", workflow: "图生图 · 风格重绘", createdAt: "昨天", prompt: "胶片颗粒人像，暖调，浅景深" },
  { id: "a11", type: "image", title: "3D 卡通屋", seed: 207744, model: "yunhui-anime3", ratio: "1:1", workflow: "文生图 · 基础", createdAt: "昨天", prompt: "3D 渲染卡通小屋，糖果色，柔和阴影" },
  { id: "a12", type: "image", title: "霓虹鲸落", seed: 902335, model: "huapro-xl", ratio: "16:9", workflow: "文生视频", createdAt: "昨天", prompt: "鲸鱼在星空中游弋，梦幻，慢镜头" },
];
