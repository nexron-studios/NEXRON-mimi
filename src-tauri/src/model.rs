use serde::Serialize;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Emitter};

const MODEL_FILE: &str = "ggml-base.bin";
const MODEL_URL: &str =
    "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin?download=true";
const MODEL_SIZE_MB: u32 = 148;
const MIN_VALID_BYTES: u64 = 50_000_000;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelStatus {
    pub is_ready: bool,
    pub name: String,
    pub size_mb: u32,
    pub path: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DownloadProgress {
    downloaded_bytes: u64,
    total_bytes: u64,
}

pub fn model_path(data_dir: &Path) -> PathBuf {
    data_dir.join("models").join(MODEL_FILE)
}

pub fn status(data_dir: &Path) -> ModelStatus {
    let path = model_path(data_dir);
    let is_ready = fs::metadata(&path)
        .map(|meta| meta.len() >= MIN_VALID_BYTES)
        .unwrap_or(false);
    ModelStatus {
        is_ready,
        name: "Whisper base (multilingual)".into(),
        size_mb: MODEL_SIZE_MB,
        path: path.to_string_lossy().into_owned(),
    }
}

pub fn download(app: &AppHandle, data_dir: &Path) -> Result<(), String> {
    let path = model_path(data_dir);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let mut response = reqwest::blocking::Client::builder()
        .build()
        .map_err(|e| e.to_string())?
        .get(MODEL_URL)
        .send()
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Download failed: HTTP {}", response.status()));
    }

    let total = response.content_length().unwrap_or(0);
    let tmp = path.with_extension("part");
    let mut file = fs::File::create(&tmp).map_err(|e| e.to_string())?;

    let mut buffer = [0u8; 1 << 16];
    let mut downloaded: u64 = 0;
    let mut last_emit: u64 = 0;

    loop {
        let read = response.read(&mut buffer).map_err(|e| e.to_string())?;
        if read == 0 {
            break;
        }
        file.write_all(&buffer[..read]).map_err(|e| e.to_string())?;
        downloaded += read as u64;
        if downloaded - last_emit >= 1_000_000 {
            last_emit = downloaded;
            let _ = app.emit(
                "model-download",
                DownloadProgress {
                    downloaded_bytes: downloaded,
                    total_bytes: total,
                },
            );
        }
    }

    file.flush().map_err(|e| e.to_string())?;
    drop(file);
    fs::rename(&tmp, &path).map_err(|e| e.to_string())?;

    let final_total = total.max(downloaded);
    let _ = app.emit(
        "model-download",
        DownloadProgress {
            downloaded_bytes: final_total,
            total_bytes: final_total,
        },
    );
    Ok(())
}
