mod auto_start;
mod db_log;
mod file_log;
mod frp_doc;
mod frp_manager;
mod frpc;
mod number_map;
mod path_utils;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    file_log::init().expect("Failed to initialize log file");
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            frpc::add_frpc,
            frpc::delete_frpc,
            frpc::read_frpc_config,
            frpc::write_frpc_config,
            frpc::query_frpc_logs,
            frpc::run_frpc,
            frpc::stop_frpc,
            frpc::stop_all_frpc,
            frpc::check_frpc_is_running,
            frp_manager::write_config,
            frp_manager::read_config,
            frp_doc::run_frp_doc_server,
            file_log::log_debug,
            file_log::log_info,
            file_log::log_warn,
            file_log::log_error,
            auto_start::is_enabled_auto_start,
            auto_start::enable_auto_start,
            auto_start::disable_auto_start,
            number_map::get_and_increment
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
