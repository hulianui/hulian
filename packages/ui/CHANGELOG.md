# @hulianui/ui

## 0.1.1

### Patch Changes

- video 组件 SSR 安全：MediaPlayer 加挂载守卫，首帧渲同比例占位、挂载后再渲真播放器，避免 Vidstack 在 SSR/静态导出时摸 `window` 报错。
