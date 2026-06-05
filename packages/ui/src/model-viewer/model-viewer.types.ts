import type { CSSProperties, ReactNode } from "react";

export interface ModelViewerProps {
  /**
   * 放进 3D 舞台中央的「模型」内容（任意 React 节点）。
   * 瑚琏化把原 three.js 的 GLTF/FBX/OBJ 模型替换为任意 children——
   * 可放产品图、卡片、SVG、emoji 等，由组件统一施加 3D 旋转 / 视差 / 悬停倾斜。
   */
  children?: ReactNode;
  /**
   * 舞台宽度（px 或任意 CSS 长度），默认 "100%"，由外层容器约束。
   */
  width?: number | string;
  /**
   * 舞台高度（px 或任意 CSS 长度），默认 360。
   */
  height?: number | string;
  /**
   * 初始偏航角（绕 Y 轴，单位 °），默认 -20。拖拽时在此基础上累加。
   */
  defaultRotationY?: number;
  /**
   * 初始俯仰角（绕 X 轴，单位 °），默认 12。拖拽时在此基础上累加。
   */
  defaultRotationX?: number;
  /**
   * 透视景深（px），越小 3D 透视越夸张，默认 1000。
   */
  perspective?: number;
  /**
   * 是否允许鼠标拖拽手动旋转，默认 true。松手后带惯性缓停。
   */
  enableManualRotation?: boolean;
  /**
   * 是否开启鼠标视差（指针在舞台内移动时模型轻微位移），默认 true。
   */
  enableMouseParallax?: boolean;
  /**
   * 是否开启悬停倾斜（指针靠近时模型朝指针方向倾斜），默认 true。
   */
  enableHoverRotation?: boolean;
  /**
   * 是否自动绕 Y 轴匀速旋转，默认 false。与手动拖拽叠加。
   */
  autoRotate?: boolean;
  /**
   * 自动旋转角速度（度/秒），默认 24。仅 autoRotate=true 时生效。
   */
  autoRotateSpeed?: number;
  /**
   * 是否显示右上角「重置视角」工具按钮，默认 true。
   * 对应原组件的截图按钮位，瑚琏化改为复位交互（无 WebGL 不截图）。
   */
  showResetButton?: boolean;
  /**
   * 是否在底部投出柔和接触阴影（呼应原 ContactShadows），默认 true。
   */
  showContactShadow?: boolean;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
