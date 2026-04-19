# 🗺️ AutoFilm AI — Implementation Roadmap

> **Philosophy:** This project exists in the spirit of *Sovereign Intelligence* — every capability we add must be achievable locally, without subscriptions, without handing your creative work to a third party. Quality over speed. We build it right, or we don't build it yet.
>
> This roadmap is a living document. As phases are completed, items are checked off and the next phase begins. Community members can pick up any unchecked item and open a PR.

---

## Current State (v2.0 — April 2026)

The core pipeline is functional end-to-end:

- ✅ Supabase auth (email/password), profiles, credits, and project storage
- ✅ Gemma 4 via Ollama for scene scripting (local-first, OpenRouter fallback)
- ✅ LTX-Video 2.3 sidecar for GPU-accelerated video generation
- ✅ Neural FFmpeg Fallback — cinematic zoom-pan + motion blur on any hardware
- ✅ Directorial Suite — scene editor with drag-to-reorder before render
- ✅ Visual Style + Mood controls wired through the full pipeline
- ✅ Final film assembled via FFmpeg and stored in Supabase Storage
- ✅ Film Gallery with 5-second polling for live progress updates

---

## Phase 1 — Polish & Reliability (Short Films Work Great)

> Goal: Every user who follows the README gets a beautiful short film on the first try, with no rough edges in the UI or the pipeline.

### 1.1 UI / UX
- [ ] **Replace `alert()` calls** with a proper toast notification component (shadcn `Sonner` or equivalent) — currently `IdeaForm.tsx` uses `alert()` for errors and completion, which breaks immersion
- [ ] **Real progress polling** — the loading screen currently simulates progress with hardcoded delays; it should poll `projects.progress` from Supabase every 3 seconds and reflect the actual backend state
- [ ] **Error detail in gallery** — when a film fails, show the `error_log` from the database in the "Signal Lost" card so users know exactly what went wrong
- [ ] **Scene count selector** — allow users to choose 2, 4, 6, or 8 scenes before drafting (currently hardcoded to 4 in the Gemma prompt)
- [ ] **Scene duration controls** — let users set per-scene duration (3–10 seconds) in the Directorial Suite editor; currently all scenes are fixed at 5 seconds
- [ ] **Visual prompt editing** — the Directorial Suite lets users edit `description` but not `visual_prompt`; expose the visual prompt field so power users can refine LTX instructions directly

### 1.2 Pipeline Reliability
- [ ] **FFmpeg PATH check on startup** — if `ffmpeg` is not found, surface a clear warning in the Next.js server log and return a helpful 503 from the API rather than a cryptic crash
- [ ] **Temp directory cleanup** — build directories under `os.tmpdir()` are cleaned for the final video file but scene clips are not always removed; add a full `buildDir` cleanup after successful upload
- [ ] **Supabase Storage bucket guard** — if the `videos` bucket doesn't exist, the upload fails silently; add a `getOrCreateBucket` check in the engine before the first upload attempt
- [ ] **Concurrent generation limit** — if a user submits twice quickly, two background jobs race against the same `projectId`; add a check that rejects a new job if one is already running for that project

### 1.3 Developer Experience
- [ ] **Docker Compose file** — `docker-compose.yml` with three services: `web` (Next.js), `sidecar` (Python FastAPI), `ollama`; lets new contributors run `docker compose up` and have everything working in minutes
- [ ] **Makefile / scripts** — `make setup`, `make dev`, `make sidecar` shortcuts that handle the multi-terminal startup so users don't have to read three separate steps
- [ ] **Health-check endpoint** — `GET /api/health` that probes Ollama, the LTX sidecar, and Supabase and returns a JSON status object; displayed as a status badge in the UI header

---

## Phase 2 — Cinematic Quality Upgrade

> Goal: Films that make people stop scrolling. The technical pipeline is solid; now we focus on what makes output genuinely beautiful and emotionally resonant.

### 2.1 Smarter Scripting
- [ ] **Multi-turn Gemma dialogue** — instead of a single prompt, use a two-step conversation: first generate the narrative arc and character descriptions, then generate scene-by-scene visual/audio prompts with the arc as context; produces far more coherent stories
- [ ] **Genre templates** — pre-built system prompts for Horror, Romance, Sci-Fi, Documentary, and Comedy that prime Gemma with genre-specific cinematography language (Dutch angles for horror, golden-hour warmth for romance, etc.)
- [ ] **Character bible** — before scripting scenes, Gemma generates a "character sheet" (appearance, costume, age, distinguishing features) that is injected into every subsequent scene's visual prompt to improve consistency
- [ ] **Negative prompt support** — expose a field in the UI for negative prompts (things to avoid) and pass them through to LTX and the FFmpeg fallback's image fetch

### 2.2 Better Video
- [ ] **LTX quantisation options** — add `--quantize [4bit|8bit|fp16]` flag to the sidecar startup and expose it in the UI as a "Performance Mode" toggle; makes LTX usable on 12–16GB VRAM cards
- [ ] **Frame interpolation pass** — after LTX generates frames, run RIFE (Real-Time Intermediate Flow Estimation) to interpolate to 60fps before FFmpeg assembly; produces dramatically smoother motion at no quality cost
- [ ] **Colour grading LUT support** — let users upload or select from a set of cinematic `.cube` LUT files that FFmpeg applies in the final assembly step (Teal & Orange, Bleach Bypass, Kodak Vision, etc.)
- [ ] **Aspect ratio options** — 16:9 (default), 2.39:1 (anamorphic widescreen), 9:16 (vertical/Reels), 1:1 (square)

### 2.3 Audio
- [ ] **Local music generation with MusicGen** — integrate Meta's MusicGen (Apache 2.0, runs locally) to generate a background score for each scene based on its `audio_prompt`; output is mixed under the video in the final FFmpeg assembly
- [ ] **Foley layer** — use Gemma to generate a list of sound events per scene (footsteps, wind, rain) and map them to a local library of royalty-free `.wav` files bundled with the repo
- [ ] **Narration / voiceover** — optionally generate a voiceover track using a local TTS model (Kokoro TTS is Apache 2.0 and runs on CPU); Gemma writes the narration text as part of scene scripting

---

## Phase 3 — Extended Format (Short Episodes, 5–15 min)

> Goal: Move beyond single-idea 20-second shorts into proper narrative episodes with acts, continuity, and a defined beginning, middle, and end.

### 3.1 Act Structure
- [ ] **Three-act script generator** — extend the Gemma prompt to produce a full three-act structure (Setup → Confrontation → Resolution) before breaking into individual scenes; each act can contain 4–8 scenes
- [ ] **Scene continuity context** — when generating each scene's video prompt, include a summary of the preceding scene so LTX/FFmpeg can be guided toward visual continuity (same lighting conditions, time of day, environment)
- [ ] **Chapter markers** — write chapter metadata into the final MP4 container so the gallery player can show act/scene navigation

### 3.2 Character Consistency
- [ ] **IP-Adapter integration** — use IP-Adapter with the LTX sidecar to condition video generation on a reference character image; the character sheet from Phase 2 generates a reference portrait that is used as the IP-Adapter condition for every scene featuring that character
- [ ] **Character portrait generator** — a separate UI panel where users can describe or upload a reference image for each main character before generation begins

### 3.3 Production Pipeline
- [ ] **Project versioning** — allow multiple "cuts" of the same project (the engine saves each generation run as a versioned cut rather than overwriting); users can compare cuts and choose which to keep
- [ ] **Scene re-generation** — a "Re-shoot" button on individual scenes in the gallery that re-runs only that scene's video generation and splices it back into the final cut without regenerating the whole film
- [ ] **Export options** — beyond the default MP4, offer ProRes-compatible MOV export (for editors) and a ZIP of individual scene clips with the generation metadata JSON

---

## Phase 4 — Full-Length Feature Films

> Goal: The original vision. A user describes a feature film idea and the system produces a complete 60–90 minute film, locally, on consumer hardware.

> **Note:** This phase is the horizon we are building toward. Each phase below it is a stepping stone. We will not rush here — the architecture must be right.

### 4.1 Long-Context Scripting
- [ ] **Full screenplay generator** — use Gemma 4's long-context window to generate a complete feature screenplay (70–100 scenes) from a logline and genre selection; screenplay is stored as a structured JSON document in Supabase
- [ ] **Scene dependency graph** — build a graph of which scenes share characters, locations, and time-of-day so the render scheduler can batch scenes with identical conditions and generate them in parallel
- [ ] **Revision loop** — after the first screenplay draft, run a second Gemma pass that critiques pacing, character arcs, and dialogue and rewrites weak scenes before rendering begins

### 4.2 Scalable Rendering
- [ ] **Queue-based rendering** — replace the current `setImmediate` background job with a proper queue (BullMQ or a simple Supabase-backed job table) so long renders survive server restarts and can be paused/resumed
- [ ] **Multi-GPU scene distribution** — if multiple GPUs are detected, distribute scene rendering across them in parallel; the queue assigns scenes to available workers based on VRAM availability
- [ ] **Checkpoint saves** — save each completed scene clip to local disk before proceeding; if the render is interrupted at scene 47, it resumes from scene 48 rather than starting over

### 4.3 Post-Production
- [ ] **Automated edit pass** — after all scenes are rendered, run a second FFmpeg pass that applies scene-transition effects (crossfades, match cuts suggested by Gemma based on scene content) rather than hard cuts
- [ ] **Credit sequence generator** — automatically generate an end-credit sequence listing the AI models used, the user's name/pseudonym, and the generation timestamp
- [ ] **Subtitle / caption export** — use the scene dialogue from the screenplay to generate an SRT subtitle file alongside the final film

---

## Phase 5 — Community & Ecosystem

> Goal: Make AutoFilm AI the launchpad for a sovereign creative ecosystem, not just a tool.

- [ ] **Film sharing feed** — an optional, opt-in public gallery where users can share their generated films with a unique link; entirely self-hostable
- [ ] **Model marketplace** — a curated list of compatible local models (video diffusion, audio, TTS, LLM) with one-command install scripts; community-vetted and tested against the pipeline
- [ ] **Plugin architecture** — a documented interface for adding custom video generation backends, audio generators, or export formatters without forking the core codebase
- [ ] **Sovereign hosting guide** — a step-by-step guide to self-hosting the entire stack (Next.js + Supabase local + Ollama + sidecar) on a home server or a bare-metal VPS so nothing runs on another company's infrastructure

---

## How to Contribute

1. Pick any unchecked item from any phase
2. Open an issue with the title of the item to claim it
3. Build it — quality over speed, always
4. Open a PR with a short demo (screenshot or video) and a description of your approach

Every contributor is building toward the same goal: a world where anyone, anywhere, can bring their creative vision to life without asking permission from a platform or a subscription service.

---

*This roadmap reflects the principles of Sovereign Intelligence — full ownership, full control, full creative freedom.*
