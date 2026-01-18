use std::path::Path;

use std::env::current_exe;

#[tauri::command]
pub fn get_app_dir() -> Result<String, String> {
    match current_exe() {
        Ok(p) => {
            let path = Path::new(&p);
            if let Some(parent_path) = path.parent() {
                Ok(parent_path.to_string_lossy().to_string().replace("\\", "/"))
            } else {
                Err("Failed to get parent directory of current exe.".to_string())
            }
        }
        Err(e) => Err(format!("Failed to get current exe: {}", e)),
    }
}
