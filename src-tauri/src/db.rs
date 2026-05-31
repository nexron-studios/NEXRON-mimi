use rusqlite::Connection;
use serde::Serialize;
use std::path::Path;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Transcript {
    pub id: i64,
    pub text: String,
    pub language: String,
    pub duration_ms: i64,
    pub created_at: String,
}

pub fn open(path: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(path)?;
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         CREATE TABLE IF NOT EXISTS transcripts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            text        TEXT NOT NULL,
            language    TEXT NOT NULL,
            duration_ms INTEGER NOT NULL,
            created_at  TEXT NOT NULL
         );",
    )?;
    Ok(conn)
}
