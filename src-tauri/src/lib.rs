mod db;
mod model;
mod transcribe;

use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use rusqlite::{params, Connection};
use tauri::{AppHandle, Manager, State};
use whisper_rs::WhisperContext;

struct AppState {
    db: Mutex<Connection>,
    whisper: Arc<Mutex<Option<WhisperContext>>>,
    data_dir: PathBuf,
}

#[tauri::command]
fn get_model_status(state: State<'_, AppState>) -> model::ModelStatus {
    model::status(&state.data_dir)
}

#[tauri::command]
async fn download_model(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let data_dir = state.data_dir.clone();
    tauri::async_runtime::spawn_blocking(move || model::download(&app, &data_dir))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn transcribe(
    pcm: Vec<f32>,
    language: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let model_path = model::model_path(&state.data_dir);
    let whisper = state.whisper.clone();

    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = whisper.lock().map_err(|_| "Whisper lock poisoned".to_string())?;
        if guard.is_none() {
            *guard = Some(transcribe::load_context(&model_path)?);
        }
        let ctx = guard.as_ref().expect("context loaded above");
        let lang = match language.as_str() {
            "auto" | "" => None,
            other => Some(other),
        };
        transcribe::run(ctx, &pcm, lang)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
fn list_transcripts(state: State<'_, AppState>) -> Result<Vec<db::Transcript>, String> {
    let conn = state.db.lock().map_err(|_| "DB lock poisoned".to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, text, language, duration_ms, created_at
             FROM transcripts ORDER BY id DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(db::Transcript {
                id: row.get(0)?,
                text: row.get(1)?,
                language: row.get(2)?,
                duration_ms: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_transcript(
    text: String,
    language: String,
    duration_ms: i64,
    state: State<'_, AppState>,
) -> Result<db::Transcript, String> {
    let conn = state.db.lock().map_err(|_| "DB lock poisoned".to_string())?;
    let created_at = chrono::Local::now().to_rfc3339();
    conn.execute(
        "INSERT INTO transcripts (text, language, duration_ms, created_at)
         VALUES (?1, ?2, ?3, ?4)",
        params![text, language, duration_ms, created_at],
    )
    .map_err(|e| e.to_string())?;
    Ok(db::Transcript {
        id: conn.last_insert_rowid(),
        text,
        language,
        duration_ms,
        created_at,
    })
}

#[tauri::command]
fn delete_transcript(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| "DB lock poisoned".to_string())?;
    conn.execute("DELETE FROM transcripts WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn clear_transcripts(state: State<'_, AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| "DB lock poisoned".to_string())?;
    conn.execute("DELETE FROM transcripts", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let conn = db::open(&data_dir.join("mimi.db"))?;
            app.manage(AppState {
                db: Mutex::new(conn),
                whisper: Arc::new(Mutex::new(None)),
                data_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_model_status,
            download_model,
            transcribe,
            list_transcripts,
            save_transcript,
            delete_transcript,
            clear_transcripts
        ])
        .run(tauri::generate_context!())
        .expect("error while running mimi");
}
