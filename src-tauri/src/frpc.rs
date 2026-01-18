use crate::{db_log::LogDBManager, path_utils::get_app_dir};
use chrono::Local;
use lazy_static::lazy_static;
use rusqlite::params;
use std::{
    collections::HashMap,
    io::{BufRead, BufReader},
    os::windows::process::CommandExt,
    path::Path,
    process::{Child, Command, Stdio},
    sync::Arc,
};
use uuid::Uuid;

lazy_static! {
    static ref LOGS_DB: tokio::sync::Mutex<Option<Arc<LogDBManager>>> =
        tokio::sync::Mutex::new(None);
    static ref FRPC_BY_ID: Arc<tokio::sync::Mutex<HashMap<String, Arc<tokio::sync::Mutex<Child>>>>> =
        Arc::new(tokio::sync::Mutex::new(HashMap::new()));
    static ref FRPC_LOG_HANDLE_BY_ID: Arc<tokio::sync::Mutex<HashMap<String, tokio::task::JoinHandle<()>>>> =
        Arc::new(tokio::sync::Mutex::new(HashMap::new()));
    static ref FRPC_START_TIME_BY_ID: Arc<tokio::sync::Mutex<HashMap<String, String>>> =
        Arc::new(tokio::sync::Mutex::new(HashMap::new()));
}

async fn get_logs_db() -> Result<Arc<LogDBManager>, String> {
    let mut logs_db = LOGS_DB.lock().await;
    if logs_db.is_none() {
        let app_dir = get_app_dir().map_err(|err| format!("Failed to get app dir: {}", err))?;
        let logs_dir = format!("{}/logs", app_dir);
        if !Path::new(&logs_dir).exists() {
            std::fs::create_dir_all(&logs_dir).map_err(|e| format!("创建日志目录失败: {}", e))?;
        }
        let db_path = format!("{}/logs.db", logs_dir);

        let manager = LogDBManager::new(&db_path)
            .map_err(|err| format!("Failed to initialize logs.db: {}", err))?;

        *logs_db = Some(Arc::new(manager));
    }

    logs_db
        .as_ref()
        .cloned()
        .ok_or_else(|| "LOGS_DB is not initialized".to_string())
}

#[tauri::command]
pub fn add_frpc(id: String) -> Result<(), String> {
    let app_dir = get_app_dir()?;
    let frpc_dir = format!("{}/frpc/{}", app_dir, id);
    if !Path::new(&frpc_dir).exists() {
        std::fs::create_dir_all(&frpc_dir).map_err(|e| format!("创建 frpc 目录失败: {}", e))?;
    }

    let config_file = format!("{}/frpc.json", frpc_dir);
    if !Path::new(&config_file).exists() {
        std::fs::File::create(&config_file)
            .map_err(|e| format!("创建 frpc 配置文件失败: {}", e))?;
    }

    let binary_file_source_path = format!("{}/resources/release/default/frpc.exe", app_dir);
    let binary_file_target_path = format!("{}/frpc.exe", frpc_dir);
    std::fs::copy(&binary_file_source_path, &binary_file_target_path)
        .map_err(|e| format!("复制 frpc 二进制文件失败: {}", e))?;

    let frpc_default_config = get_frpc_default_config();

    std::fs::write(&config_file, frpc_default_config)
        .map_err(|e| format!("写入 frpc 配置文件失败: {}", e))?;

    Ok(())
}

fn get_frpc_default_config() -> String {
    serde_json::json!({
        "auth": {
            "method": "token",
            "token": ""
        },
        "dnsServer": "114.114.114.114",
        "metadatas": {},
        "natHoleStunServer": "stun.easyvoip.com:3478",
        "proxies": [],
        "serverAddr": "xclhove.top",
        "serverPort": 38003,
        "visitors": []
    })
    .to_string()
}

#[tauri::command]
pub fn delete_frpc(id: String) -> Result<(), String> {
    let app_dir = get_app_dir()?;
    let frpc_dir = format!("{}/frpc/{}", app_dir, id);
    if Path::new(&frpc_dir).exists() {
        std::fs::remove_dir_all(&frpc_dir).map_err(|e| format!("删除 frpc 目录失败: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn read_frpc_config(id: String) -> Result<String, String> {
    let app_dir = get_app_dir()?;
    let frpc_dir = format!("{}/frpc/{}", app_dir, id);
    let config_file = format!("{}/frpc.json", frpc_dir);

    if !Path::new(&config_file).exists() {
        return Err(format!("frpc 配置文件不存在: {}", config_file));
    }

    let config_content = std::fs::read_to_string(&config_file)
        .map_err(|e| format!("读取 frpc 配置文件失败: {}", e))?;
    Ok(config_content)
}

#[tauri::command]
pub fn write_frpc_config(id: String, config: String) -> Result<(), String> {
    let app_dir = get_app_dir()?;
    let frpc_dir = format!("{}/frpc/{}", app_dir, id);
    let config_file = format!("{}/frpc.json", frpc_dir);

    if !Path::new(&config_file).exists() {
        return Err(format!("frpc 配置文件不存在: {}", config_file));
    }

    std::fs::write(&config_file, config).map_err(|e| format!("写入 frpc 配置文件失败: {}", e))?;
    Ok(())
}

use crate::file_log::log_info;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct Logs {
    id: String,
    log_type: String,
    content: String,
    create_time: String,
    order_number: i32,
}

#[tauri::command]
pub async fn query_frpc_logs(id: String, order_number: i32) -> Result<Vec<Logs>, String> {
    let logs_db = get_logs_db().await?;

    let frpc_start_time_by_id = FRPC_START_TIME_BY_ID.lock().await;
    let start_time = match frpc_start_time_by_id.get(&id) {
        None => Local::now().format("%%Y-%m-%d %H:%M:%S").to_string(),
        Some(v) => v.to_string(),
    };

    logs_db.execute(|connection| {
        let log_type = format!("frpc:{}", id);

        let sql = String::from(
            r#"
            SELECT id, log_type, content, create_time, rowid as order_number
            FROM logs
            WHERE log_type = ?
            AND order_number > ?
            AND (create_time > ? or create_time = ?)
            ORDER BY rowid
        "#,
        );
        let params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![
            Box::new(log_type),
            Box::new(order_number),
            Box::new(start_time.clone()),
            Box::new(start_time),
        ];

        let mut stmt = connection
            .prepare(&sql)
            .map_err(|e| format!("准备SQL语句失败: {}", e))?;

        let rows = stmt
            .query_map(rusqlite::params_from_iter(params_vec), |row| {
                Ok(Logs {
                    id: row.get(0)?,
                    log_type: row.get(1)?,
                    content: row.get(2)?,
                    create_time: row.get(3)?,
                    order_number: row.get(4)?,
                })
            })
            .map_err(|e| format!("执行查询失败: {}", e))?;

        let mut logs = Vec::new();
        for row in rows {
            logs.push(row.map_err(|e| format!("获取行数据失败: {}", e))?);
        }

        Ok(logs)
    })
}

#[tauri::command]
pub async fn run_frpc(id: String, binary_file: String, args: String) -> Result<bool, String> {
    let frpc_by_id = FRPC_BY_ID.lock().await;
    if frpc_by_id.contains_key(&id) {
        return Ok(false);
    }
    drop(frpc_by_id);

    let app_dir = get_app_dir()?;
    let frpc_dir = format!("{}/frpc/{}", app_dir, id);
    let mut binary_file_path = format!("{}/frpc.exe", frpc_dir);

    if !binary_file.is_empty() {
        binary_file_path = binary_file;
    }

    let config_file_path = format!("{}/frpc.json", frpc_dir);
    let mut run_args = format!("-c {}", config_file_path);
    if !args.is_empty() {
        run_args = args;
    }

    let create_no_window: u32 = 134217728u32;
    let start_time = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let frp_client_child = Command::new(&binary_file_path)
        .args(run_args.split_whitespace())
        .stdout(Stdio::piped())
        .creation_flags(create_no_window)
        .spawn()
        .map_err(|e| format!("启动 frpc 失败: {}", e))?;
    log_info(format!("启动 frpc: 【{}】({})", id, frp_client_child.id()));
    FRPC_START_TIME_BY_ID
        .lock()
        .await
        .insert(id.clone(), start_time);
    let frp_client_child = Arc::new(tokio::sync::Mutex::new(frp_client_child));

    let stdout = {
        let mut child = frp_client_child.lock().await;
        child
            .stdout
            .take()
            .ok_or_else(|| "Failed to capture stdout".to_string())?
    };

    let reader = BufReader::new(stdout);

    let logs_db = get_logs_db().await?;
    let frpc_id = id.clone();

    let log_handle = tokio::spawn(async move {
        for line in reader.lines().filter_map(|line| line.ok()) {
            if let Err(e) = logs_db.execute(|connection| {
                connection
                    .execute(
                        "INSERT INTO logs (id, log_type, content, create_time)
                         VALUES (?, ?, ?, datetime('now', 'localtime'))",
                        params![
                            Uuid::new_v4().to_string(),
                            format!("frpc:{}", frpc_id),
                            line
                        ],
                    )
                    .map_err(|e| e.to_string())?;
                Ok(())
            }) {
                eprintln!("写入日志失败: {}", e);
            }
        }
    });

    {
        let mut frpc_by_id = FRPC_BY_ID.lock().await;
        frpc_by_id.insert(id.clone(), frp_client_child);
    }

    {
        let mut frpc_log_handle_by_id = FRPC_LOG_HANDLE_BY_ID.lock().await;
        frpc_log_handle_by_id.insert(id.clone(), log_handle);
    }

    Ok(true)
}

#[tauri::command]
pub async fn stop_frpc(id: String) -> Result<(), String> {
    {
        let mut frpc_by_id = FRPC_BY_ID.lock().await;
        if let Some(child) = frpc_by_id.remove(&id) {
            let mut child_lock = child.lock().await;
            if let Err(e) = child_lock.kill() {
                return Err(format!("终止 frpc 进程失败: {}", e));
            }
        } else {
            return Err(format!("找不到 frpc 进程: {}", id));
        }
    }

    {
        let mut frpc_log_handle_by_id = FRPC_LOG_HANDLE_BY_ID.lock().await;
        if let Some(handle) = frpc_log_handle_by_id.remove(&id) {
            handle.abort();
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn stop_all_frpc() -> Result<(), String> {
    // 获取所有 frpc 进程的 ID
    let frpc_ids = {
        let frpc_by_id = FRPC_BY_ID.lock().await;
        frpc_by_id.keys().cloned().collect::<Vec<String>>()
    };

    // 用于收集所有错误信息
    let mut errors = Vec::new();

    // 停止所有 frpc 进程
    for id in frpc_ids {
        if let Err(e) = stop_frpc(id.clone()).await {
            errors.push(format!("停止进程 {} 失败: {}", id, e));
        }
    }

    // 如果有错误发生，返回所有错误信息
    if !errors.is_empty() {
        return Err(errors.join("; "));
    }

    Ok(())
}

#[tauri::command]
pub async fn check_frpc_is_running(id: String) -> Result<bool, String> {
    let frpc_by_id = FRPC_BY_ID.lock().await;
    Ok(frpc_by_id.contains_key(&id))
}
