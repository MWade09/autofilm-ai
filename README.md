# 🎬 AutoFilm AI: Sovereign Studio (v2.0)

AutoFilm AI is a world-class, local-first cinematic production suite. It leverages the April 2026 state-of-the-art open-source models—**Gemma 4** and **LTX-2.3**—to generate synchronized 1080p movies with native soundscapes, completely free and private.

---

## ⚡ Hardware Requirements (Sovereign Level)

To achieve "Hollywood style" results locally/free, the following hardware is recommended:

| Component | Minimum | Recommended (Cinema Grade) |
| :--- | :--- | :--- |
| **GPU (NVIDIA)** | 16GB VRAM (RTX 3080 Ti) | **24GB VRAM (RTX 3090 / 4090)** |
| **System RAM** | 16GB | 64GB |
| **Storage** | 60GB SSD | 150GB NVMe SSD |
| **OS** | Windows 10/11 (WSL2) | Linux (Ubuntu 22.04+) |

*Note: If you do not meet these specs, the engine will automatically fall back to our high-fidelity "Neural FFmpeg" layer, which works on any modern CPU/GPU.*

---

## 🚀 Quick Start (Automated Setup)

### 1. Prerequisites
- [Ollama](https://ollama.com/) (For the Narrative Engine)
- [Python 3.10+](https://www.python.org/) (For the Video/Audio Sidecars)
- [FFmpeg](https://ffmpeg.org/) (System-wide installation)

### 2. Narrative Engine (Gemma 4)
Open your terminal and pull the April 2026 multimodal powerhouse:
```bash
ollama run gemma4:26b
```

### 3. Production Sidecars (LTX-2.3)
We utilize a "Sidecar" architecture to separate the heavy neural processing from the web UI. 
```bash
# Navigate to sidecar directory and run setup
cd sidecar
python setup.py
python main.py
```

### 4. Launch the UI
```bash
npm install
npm run dev
```

---

## 🏗️ System Architecture

- **Narrative UI (Next.js)**: The command center. Handles scene reordering, directorial editing, and portal transitions.
- **Brain (Gemma 4 MoE)**: A 26-billion parameter Mixture-of-Experts model that architects synchronized audio/visual prompts.
- **The Forge (LTX-2.3)**: An open-weights video engine that generates 1080p clips with **native synchronized audio**.
- **Stitcher (FFmpeg)**: The final assembly line that combines scenes into the final .mp4 container.

## 🔐 Privacy & Sovereignty
By default, AutoFilm AI probes for local services. No data leaves your machine unless you explicitly configure a Cloud Fallback (OpenAI/Fal.ai) in your `.env`.

---

## 🛠️ Troubleshooting
- **Memory Errors**: If your GPU runs out of VRAM, ensure the sidecar is running in `--quantize 4bit` mode.
- **Port Conflicts**: The sidecars default to port `8081`. Ensure this is available in your firewall.

---
*Created by Antigravity & [Your Name/Company]*
