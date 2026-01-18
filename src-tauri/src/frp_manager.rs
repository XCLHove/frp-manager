use std::path::Path;

use crate::path_utils::get_app_dir;

fn get_config_dir() -> Result<String, String> {
    let app_dir = get_app_dir()?;
    let config_dir = format!("{}/config", app_dir);
    if !Path::new(&config_dir).exists() {
        std::fs::create_dir(&config_dir).map_err(|e| format!("创建配置目录失败: {}", e))?;
    }
    Ok(config_dir)
}

fn init_config() -> Result<String, String> {
    let config_dir = get_config_dir()?;
    let config_file = format!("{}/config.json", config_dir);
    if !Path::new(&config_file).exists() {
        std::fs::write(config_file.clone(), get_default_config())
            .map_err(|e| format!("创建配置文件失败: {}", e))?;
    }
    Ok(config_file)
}

#[tauri::command]
pub fn write_config(config: String) -> Result<(), String> {
    let config_file = init_config()?;
    std::fs::write(config_file, config).map_err(|e| format!("写入配置文件失败: {}", e))?;
    Ok(())
}

fn get_default_config() -> String {
    return serde_json::json!({
        "frpc": [],
        "frps": []
    })
    .to_string();
}

#[tauri::command]
pub fn read_config() -> Result<String, String> {
    let config_file = init_config()?;
    return std::fs::read_to_string(config_file).map_err(|e| format!("读取配置文件失败: {}", e));
}
