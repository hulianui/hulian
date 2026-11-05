/** 平面先绕 Z 再绕 X，得到俯视等距。子元素要保持 3D，中间层不能丢掉 preserve-3d。 */
export const ISO_PLANE_CLASS =
  "[transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-42deg)]";

/** 抵消平面旋转，让人名和气泡正对屏幕。 */
export const ISO_BILLBOARD_CLASS =
  "[transform-style:preserve-3d] [transform:rotateZ(42deg)_rotateX(-58deg)]";

/**
 * 抬起的是桌子和人，不是状态气泡。
 * 气泡挂在按钮里、抬起层外面，悬停时位置不变。
 */
export const SEAT_LIFT_CLASS =
  "[transform-style:preserve-3d] transition-transform duration-200 ease-out motion-reduce:transition-none group-hover:[transform:translateZ(18px)] group-data-[selected=true]:[transform:translateZ(18px)]";
