use std::path::Path;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

pub fn load_context(model_path: &Path) -> Result<WhisperContext, String> {
    let path = model_path
        .to_str()
        .ok_or_else(|| "Invalid model path".to_string())?;
    WhisperContext::new_with_params(path, WhisperContextParameters::default())
        .map_err(|e| e.to_string())
}

pub fn run(ctx: &WhisperContext, pcm: &[f32], language: Option<&str>) -> Result<String, String> {
    let mut state = ctx.create_state().map_err(|e| e.to_string())?;

    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(language);
    params.set_translate(false);
    params.set_print_special(false);
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);

    let threads = std::thread::available_parallelism()
        .map(|n| n.get() as i32)
        .unwrap_or(4);
    params.set_n_threads(threads);

    state.full(params, pcm).map_err(|e| e.to_string())?;

    let mut text = String::new();
    for segment in state.as_iter() {
        if let Ok(part) = segment.to_str_lossy() {
            text.push_str(&part);
        }
    }
    Ok(text.trim().to_string())
}
