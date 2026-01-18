use lazy_static::lazy_static;
use std::io::ErrorKind;
use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;
use tokio::runtime::Runtime;
use tokio::sync::oneshot;

use crate::path_utils::get_app_dir;

lazy_static! {
    static ref DOC_URL: Arc<Mutex<String>> = Arc::new(Mutex::new(String::new()));
    static ref SERVER_HANDLE: Arc<Mutex<Option<JoinHandle<()>>>> = Arc::new(Mutex::new(None));
    static ref SHUTDOWN_SENDER: Arc<Mutex<Option<oneshot::Sender<()>>>> =
        Arc::new(Mutex::new(None));
}

#[tauri::command]
pub fn run_frp_doc_server() -> Result<String, String> {
    let mut url = DOC_URL.lock().map_err(|e| e.to_string())?;
    if !url.is_empty() {
        return Ok(url.clone());
    }

    let port = find_available_port(20000)?;
    *url = format!("http://localhost:{}", port);

    let app_dir = get_app_dir()?;
    let static_dir = format!("{}/resources/frp-doc", app_dir);

    // 创建异步运行时
    let rt = Runtime::new().map_err(|e| format!("Failed to create runtime: {}", e))?;

    // 创建停止信号通道
    let (shutdown_tx, shutdown_rx) = oneshot::channel();

    // 存储停止信号发送端
    *SHUTDOWN_SENDER.lock().map_err(|e| e.to_string())? = Some(shutdown_tx);

    let static_files = warp::fs::dir(static_dir);

    let addr: std::net::SocketAddr = ([0, 0, 0, 0], port).into();

    // 在线程中运行服务器
    let server_handle = std::thread::spawn(move || {
        rt.block_on(async {
            let (_, server) = warp::serve(static_files).bind_with_graceful_shutdown(addr, async {
                shutdown_rx.await.ok();
            });

            // 运行服务器直到收到停止信号
            server.await;
        });
    });

    *SERVER_HANDLE.lock().map_err(|e| e.to_string())? = Some(server_handle);

    Ok(url.clone())
}

fn find_available_port(start_port: u16) -> Result<u16, String> {
    for port in start_port..=65535 {
        match TcpListener::bind(("127.0.0.1", port)) {
            Ok(_) => return Ok(port),
            Err(ref e) if e.kind() == ErrorKind::AddrInUse => continue,
            Err(e) => return Err(format!("Failed to find available port: {}", e)),
        }
    }
    Err("No available port found".to_string())
}
