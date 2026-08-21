export interface HeroVideoDialogProps {
  /** 缩略图地址。 */
  thumbnailSrc: string;
  thumbnailAlt?: string;
  /** 视频地址：embed 形态是 iframe 的 src（youtube/bilibili embed），video 形态是视频文件地址（.mp4/.webm 等）。 */
  videoSrc: string;
  /**
   * 弹层里用什么播：`"embed"` 挂 iframe 承载第三方嵌入页，`"video"` 挂原生 `<video>` 播自托管视频文件。
   * 默认 `"auto"` 按 `videoSrc` 的扩展名判别（.mp4/.webm/.ogv/.ogg/.mov/.m4v 走 `"video"`，其余走 `"embed"`）。
   */
  videoType?: "auto" | "embed" | "video";
  className?: string;
}
