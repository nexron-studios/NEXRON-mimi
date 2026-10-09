# Rust-Seite — Tauri 2

Hier liegt, was das Frontend nicht kann: Persistenz, Dateizugriff,
OS-Integration. Rust, nicht TypeScript.

Die Tauri-Konventionen — IPC-Grenze, State, Fehlertypen, Capabilities — liegen
zentral im Brain-Repo unter `rules/tauri/` und laden automatisch für jede Datei
unter `src-tauri/` (aus `~/.claude/rules/brain/`). Hier gibt es nichts zu
importieren. Bis 2026-08-27 standen sie als Volltext in diesem Ordner, wortgleich
in Mellow und Mimi; zwei Kopien derselben Regel driften.

## Was hier nicht gilt

Kein NestJS, kein TypeORM, keine DTOs, kein Swagger — und keine der Vue-Regeln,
die fuer `../src/` gelten.

Projektspezifische Abweichungen kommen hierunter als Prosa, nie als kopierte
Regeldatei.
