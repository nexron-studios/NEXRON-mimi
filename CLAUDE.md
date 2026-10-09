# Mimi

Komplett lokale Desktop-App zum Aufnehmen, Transkribieren und Kopieren von
Sprache: Aufnahme starten → sprechen → stoppen → lokale Transkription → Text
landet in der Zwischenablage.

**Tauri-2-App, kein Client-Server-Projekt.** Transkription läuft lokal über
whisper.cpp, Transkripte liegen in einer SQLite-Datei im App-Data-Verzeichnis.
Keine Cloud, kein API-Key — das ist bindend.

## Struktur

- `src/` — Frontend: Vue 3 + TypeScript, Vite
- `src-tauri/` — Rust-Seite: Whisper-Anbindung, SQLite, globaler Hotkey,
  Zwischenablage

Es gibt **kein** `backend/` und **kein** `frontend/`. Claude Code lädt die
nächstgelegene `CLAUDE.md`.

- Frontend-Konventionen: @src/CLAUDE.md
- Rust-/Tauri-Konventionen: @src-tauri/CLAUDE.md

## Eigenheiten

Der primäre Einstieg ist der **globale Hotkey** (Standard
`Strg+Shift+Leertaste`), nicht das Fenster. Änderungen am Aufnahme-Ablauf
müssen bei geschlossenem Fenster genauso funktionieren.

Whisper braucht ein Modell auf dem Zielrechner — siehe `SETUP.md`. Das folgt
nicht aus dem Repo und ist ein eigener Setup-Schritt.

## Was hier nicht gilt

Kein NestJS, kein TypeORM, keine DTOs, kein Swagger. Regeln aus dem
`webdev-rules`-Template, die davon ausgehen, sind hier gegenstandslos.
