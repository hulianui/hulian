/** 平面先绕 Z 再绕 X，得到俯视等距。子元素要保持 3D，中间层不能丢掉 preserve-3d。 */
export const ISO_PLANE_CLASS =
  "[transform-style:preserve-3d] [transform:rotateX(58deg)_rotateZ(-42deg)]";

/** 抵消平面旋转，让人名和气泡正对屏幕。 */
export const ISO_BILLBOARD_CLASS =
  "[transform-style:preserve-3d] [transform:rotateZ(42deg)_rotateX(-58deg)]";

/**
 * 悬停和选中只加阴影。不要平移桌子或人，否则第一下点击会打在已经挪走的桌面上。
 * 状态气泡在抬起层外面，不受这层阴影影响。
 */
export const SEAT_LIFT_CLASS =
  "[transform-style:preserve-3d] transition-shadow duration-200 ease-out motion-reduce:transition-none group-hover:shadow-[0_16px_20px_-14px_rgba(0,0,0,0.55)] group-data-[selected=true]:shadow-[0_16px_20px_-14px_rgba(0,0,0,0.55)]";
