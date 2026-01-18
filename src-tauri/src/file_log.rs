use crate::path_utils::get_app_dir;
use log::{debug, error, info, warn};

pub fn init() -> Result<(), String> {
    let app_dir = get_app_dir()?;
    let log_config_file = format!("{}/config/file_log.yaml", app_dir);
    init_log_config(log_config_file.clone())?;
    log4rs::init_file(log_config_file, Default::default()).map_err(|e| e.to_string())?;
    Ok(())
}

fn init_log_config(path: String) -> Result<(), String> {
    let path = std::path::Path::new(&path);
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    }

    if let Some(parent) = path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }

    let default_config = get_default_config();
    std::fs::write(path, default_config).map_err(|e| e.to_string())?;

    Ok(())
}

// 开发环境
#[cfg(debug_assertions)]
fn get_default_config() -> String {
    String::from(
        r#"
refresh_rate: 5 seconds

appenders:
  console:
    kind: console
    encoder:
      pattern: "[{d(%Y-%m-%d %H:%M:%S)}] [{l:5}] [{t}] {m}{n}"

  # 普通日志文件（info及以上级别）
  rolling_file:
    kind: rolling_file
    path: "logs/frp_manager.log"
    encoder:
      pattern: "[{d(%Y-%m-%d %H:%M:%S)}] [{l:5}] [{t}] {m}{n}"
    policy:
      kind: compound
      trigger:
        kind: time
        interval: 60
      roller:
        kind: fixed_window
        pattern: "logs/frp_manager.{}.log"
        base: 1
        count: 168

  # 错误日志文件（只记录error及以上级别）
  rolling_file_error:
    kind: rolling_file
    path: "logs/frp_manager_error.log"
    encoder:
      pattern: "[{d(%Y-%m-%d %H:%M:%S)}] [{l:5}] [{t}] {m}{n}"
    policy:
      kind: compound
      trigger:
        kind: time
        interval: 60
      roller:
        kind: fixed_window
        pattern: "logs/frp_manager_error.{}.log"
        base: 1
        count: 168
    filters:
      - kind: threshold
        level: error  # 只记录error及以上级别

# 根日志器配置
root:
  level: info
  appenders:
    - console
    - rolling_file
    - rolling_file_error

    "#,
    )
}

// 生产环境
#[cfg(not(debug_assertions))]
fn get_default_config() -> String {
    String::from(
        r#"
refresh_rate: 60 seconds

appenders:
  # 普通日志文件（info及以上级别）
  rolling_file:
    kind: rolling_file
    path: "logs/frp_manager.log"
    encoder:
      pattern: "[{d(%Y-%m-%d %H:%M:%S)}] [{l:5}] [{t}] {m}{n}"
    policy:
      kind: compound
      trigger:
        kind: time
        interval: 60
      roller:
        kind: fixed_window
        pattern: "logs/frp_manager.{}.log"
        base: 1
        count: 168

  # 错误日志文件（只记录error及以上级别）
  rolling_file_error:
    kind: rolling_file
    path: "logs/frp_manager_error.log"
    encoder:
      pattern: "[{d(%Y-%m-%d %H:%M:%S)}] [{l:5}] [{t}] {m}{n}"
    policy:
      kind: compound
      trigger:
        kind: time
        interval: 60
      roller:
        kind: fixed_window
        pattern: "logs/frp_manager_error.{}.log"
        base: 1
        count: 168
    filters:
      - kind: threshold
        level: error  # 只记录error及以上级别

# 根日志器配置
root:
  level: info
  appenders:
    - rolling_file
    - rolling_file_error
    "#,
    )
}

#[tauri::command]
pub fn log_debug(content: String) {
    debug!("{}", content);
}

#[tauri::command]
pub fn log_info(content: String) {
    info!("{}", content);
}

#[tauri::command]
pub fn log_warn(content: String) {
    warn!("{}", content);
}

#[tauri::command]
pub fn log_error(content: String) {
    error!("{}", content);
}
