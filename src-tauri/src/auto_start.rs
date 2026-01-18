use tauri_plugin_autostart::ManagerExt;

#[tauri::command]
pub fn is_enabled_auto_start(app: tauri::AppHandle) -> Result<bool, String> {
    let autostart_manager = app.autolaunch();
    autostart_manager
        .is_enabled()
        .map_err(|err| err.to_string())
}

#[tauri::command]
pub fn enable_auto_start(app: tauri::AppHandle) -> Result<(), String> {
    let autostart_manager = app.autolaunch();
    autostart_manager.enable().map_err(|err| err.to_string())
}

#[tauri::command]
pub fn disable_auto_start(app: tauri::AppHandle) -> Result<(), String> {
    let autostart_manager = app.autolaunch();
    autostart_manager.disable().map_err(|err| err.to_string())
}
