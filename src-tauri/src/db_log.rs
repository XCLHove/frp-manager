use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;
use std::sync::Arc;

#[derive(Clone)]
pub struct LogDBManager {
    pool: Arc<Pool<SqliteConnectionManager>>,
}

impl LogDBManager {
    pub fn new(db_file_path: &str) -> Result<Self, String> {
        if std::path::Path::new(&db_file_path).exists() {
            std::fs::remove_file(db_file_path).map_err(|e| e.to_string())?;
        }

        let connection_manager =
            SqliteConnectionManager::file(db_file_path).with_init(|connection| {
                // 启用外键和WAL模式以提升性能
                connection.pragma_update(None, "foreign_keys", &"ON")?;
                connection.pragma_update(None, "journal_mode", &"WAL")?;
                connection.pragma_update(None, "synchronous", &"NORMAL")?;
                connection.pragma_update(None, "cache_size", &"-2000")?; // 2MB缓存
                Ok(())
            });

        let connection_pool = Pool::builder()
            .max_size(20)
            .min_idle(Some(5))
            .build(connection_manager)
            .map_err(|e| format!("Failed to create connection pool: {}", e))?;

        let manager = LogDBManager {
            pool: Arc::new(connection_pool),
        };

        manager.init()?;

        Ok(manager)
    }

    pub fn init(&self) -> Result<(), String> {
        let conn = self.get_connection()?;

        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS logs (
                id VARCHAR(50) PRIMARY KEY,
                log_type VARCHAR(50),
                content TEXT,
                create_time TIMESTAMP
            );
            "#,
        )
        .map_err(|e| format!("Failed to initialize database: {}", e))?;

        Ok(())
    }

    pub fn get_connection(&self) -> Result<PooledConnection<SqliteConnectionManager>, String> {
        self.pool
            .get()
            .map_err(|e| format!("Failed to get connection from pool: {}", e))
    }

    pub fn execute<F, T>(&self, operation: F) -> Result<T, String>
    where
        F: FnOnce(&Connection) -> Result<T, String>,
    {
        let conn = self.get_connection()?;
        operation(&conn)
    }
}
