# 🎬 AutoFilm AI: Sovereign Studio (v2.0)

AutoFilm AI is a local-first, open-source cinematic production suite. It leverages **Gemma 4** (via Ollama) and **LTX-Video 2.3** to generate synchronized 1080p short films completely free and privately — no cloud required.

> **Community Project** — Built for creators who want full sovereignty over their AI pipeline. Star the repo, share your films, and help us build toward full-length feature generation.

---

## ⚡ Hardware Requirements

| Component | Minimum | Recommended (Cinema Grade) |
| :--- | :--- | :--- |
| **GPU (NVIDIA)** | 16GB VRAM (RTX 3080 Ti) | **24GB VRAM (RTX 3090 / 4090)** |
| **System RAM** | 16GB | 64GB |
| **Storage** | 60GB SSD | 150GB NVMe SSD |
| **OS** | Windows 10/11 (WSL2) | Linux (Ubuntu 22.04+) |

> **Don't have a high-end GPU?** No problem. If the LTX sidecar is not running, the engine automatically falls back to the **Neural FFmpeg Layer** — a cinematic zoom-pan + motion-blur pipeline that produces beautiful results on any modern CPU/GPU.

---

## 🚀 Quick Start

### 1. Prerequisites
- [Ollama](https://ollama.com/) — Narrative engine (runs Gemma 4 locally)
- [Python 3.10+](https://www.python.org/) — LTX-2.3 video sidecar
- [Node.js 18+](https://nodejs.org/) — Web UI
- [Supabase](https://supabase.com/) — Free database, auth & storage (cloud-hosted, but your data stays under your account)

### 2. Clone & Install
```bash
git clone https://github.com/your-username/autofilm-ai.git
cd autofilm-ai
npm install
```

### 3. Environment Variables
```bash
cp .env.example .env.local
```
Open `.env.local` and fill in your **Supabase** credentials (the only required external service). Everything else runs locally.

### 4. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/20241029122400_initial_schema.sql` → **Run**
3. Go to **Storage** → create a public bucket named **`videos`**
4. Copy your Project URL, Anon Key, and Service Role Key into `.env.local`

### 5. Narrative Engine — Gemma 4 (Local)
```bash
# Pull the model (one-time download, ~16GB)
ollama pull gemma4:26b

# Verify it runs
ollama run gemma4:26b "Say hello"
```

### 6. Video Forge — LTX-2.3 Sidecar (Optional but Recommended)
```bash
cd sidecar

# Install Python dependencies & download weights (~47GB, one-time)
python setup.py

# Start the sidecar (keep this terminal open)
python main.py
```
> The sidecar runs on `http://localhost:8081`. If it is not running, the app uses the FFmpeg Neural Fallback automatically.

### 7. Launch the UI
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — enter an idea, customize style & mood, and generate your film.

---

## 🏗️ System Architecture

```
Your Idea
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js UI  (Command Center)                                   │
│  • Scene editor & reordering                                    │
│  • Visual Style + Mood controls                                 │
│  • Portal transition animations                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │  POST /api/generate
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Workflow Engine  (lib/workflow/engine.ts)                      │
│                                                                 │
│  1. SCRIPT  →  Gemma 4 via Ollama  (local, primary)            │
│               └─ OpenRouter fallback  (cloud, optional)        │
│                                                                 │
│  2. VIDEO   →  LTX-2.3 Sidecar  (local GPU, if running)       │
│               └─ Neural FFmpeg Layer  (always available)       │
│                  (zoompan + motion-blur + cinematic grade)      │
│                                                                 │
│  3. ASSEMBLE →  FFmpeg concat  →  Supabase Storage             │
└─────────────────────────────────────────────────────────────────┘
```

- **Narrative Brain (Gemma 4 MoE)**: 26-billion parameter model that writes 4-scene scripts with LTX-optimized visual and audio prompts.
- **The Forge (LTX-Video 2.3)**: Open-weights video diffusion model (Apache 2.0) generating 1080p clips. Runs entirely on your GPU via the Python sidecar.
- **Neural FFmpeg Fallback**: When LTX is unavailable, the engine fetches a cinematic reference frame from [Pollinations.ai](https://pollinations.ai) (free, no key needed) and applies organic zoompan, motion blur, and vintage color grading via FFmpeg.
- **Stitcher**: FFmpeg concat assembles all scene clips into the final `.mp4`, which is uploaded to your Supabase Storage bucket.

## 🔐 Privacy & Sovereignty
By default, **no data leaves your machine** except:
- Scene prompts → your local Ollama instance
- Reference images → Pollinations.ai (anonymous, prompt-only, no account)
- Final film → your own Supabase project

To stay 100% air-gapped, run your own [Pollinations](https://github.com/pollinations/pollinations) instance or replace the image fetch in `engine.ts` with a local Stable Diffusion endpoint.

---

## 🛠️ Troubleshooting

| Problem | Fix |
| :--- | :--- |
| **Gemma 4 not responding** | Ensure `ollama serve` is running and `gemma4:26b` is pulled. The engine falls back to the procedural script if Ollama is unreachable. |
| **Out of VRAM during LTX** | The sidecar auto-enables CPU offload. For 16GB GPUs add `--quantize 4bit` or just let the FFmpeg fallback handle video. |
| **Port 8081 conflict** | Set `LTX_PORT=8082` before running `python main.py` and update `LTX_SIDECAR_URL` in `.env.local`. |
| **Supabase RLS errors** | Make sure you ran the full migration SQL, especially the `handle_new_user` trigger at the bottom. |
| **Video stuck at "generating"** | Check the Next.js server logs (`npm run dev` terminal) for engine errors. The most common cause is FFmpeg not being on your system PATH. |

---

## 🗺️ Roadmap

- [x] 4-scene short film generation (local-first)
- [x] Scene editor with drag-to-reorder
- [x] Neural FFmpeg fallback (works on any hardware)
- [ ] LTX-2.3 native audio synthesis integration
- [ ] Character consistency across scenes
- [ ] Longer-form generation (10–30 min episodes)
- [ ] Full-length feature film pipeline

---

*Built with ❤️ by the community. PRs welcome.*
