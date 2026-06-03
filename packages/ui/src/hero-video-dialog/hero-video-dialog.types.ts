export interface HeroVideoDialogProps {
  /** 缩略图地址。 */
  thumbnailSrc: string;
  thumbnailAlt?: string;
  /** 视频嵌入地址（iframe src，如 youtube/bilibili embed）。 */
  videoSrc: string;
  className?: string;
}
