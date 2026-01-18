use std::collections::HashMap;
use std::sync::{Arc, RwLock};

lazy_static::lazy_static! {
    static ref NUMBER_MAP: Arc<RwLock<HashMap<String, u32>>> =
        Arc::new(RwLock::new(HashMap::new()));
}

#[tauri::command]
pub fn get_and_increment(key: &str) -> Result<u32, String> {
    let mut map = NUMBER_MAP
        .write()
        .map_err(|_| "Failed to acquire write lock".to_string())?;

    let value = map.entry(key.to_string()).or_insert(0);

    if *value == 0 {
        // 如果不存在（或者值为 0），设为 1 并返回 1
        *value = 1;
        Ok(1)
    } else {
        // 如果存在，返回当前值（不递增）
        // 注意：原始代码不会递增已存在的值
        *value += 1;
        Ok(*value)
    }
}
