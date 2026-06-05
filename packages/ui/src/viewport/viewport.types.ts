import type { ReactNode } from "react";

export type ViewportDevice = "web" | "tablet" | "phone";

export interface ViewportProps {
  /** 设备预设宽度：web(满宽自适应) / tablet(768px) / phone(390px)。受控。 */
  device?: ViewportDevice;
  /** 非受控初始设备，缺省 web。 */
  defaultDevice?: ViewportDevice;
  onDeviceChange?: (device: ViewportDevice) => void;
  /** 顶部显示设备切换器（web/平板/手机·dogfood Segmented）。 */
  controls?: boolean;
  /** 自定义宽度，覆盖 device 预设（数字=px 或任意 CSS 长度）。 */
  width?: number | string;
  /** 容器命名，用于具名容器查询 `@md/name:`（缺省匿名容器，用 `@md:` 即可）。 */
  name?: string;
  /** tablet/phone 加设备感边框（默认 true）；web 恒细边框。 */
  framed?: boolean;
  /** 固定容器高度（数字=px 或 CSS），缺省随内容。 */
  height?: number | string;
  children: ReactNode;
  className?: string;
}
