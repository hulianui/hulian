#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default();

    // single-instance 必须是第一个注册的插件，但只在 release 注册：
    // dev 下 `tauri dev` 监督进程做 kill-old→start-new 重启时，会与 single-instance 锁的
    // 释放竞争——重启出来的实例发现锁还在 → 触发回调并自杀 → tauri dev 以为 app 退出 →
    // SIGTERM 掉 Next(143) → 整个 `pnpm tauri dev` 崩（表现为"自动被退出"）。dev 本就单窗，
    // 这插件在 dev 毫无价值，故仅 release 启用。
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // 再次启动时聚焦已有主窗口
            use tauri::Manager;
            if let Some(w) = app.get_webview_window("main") {
                let _ = w.set_focus();
            }
        }));
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running 瑚琏 Hulian");
}
