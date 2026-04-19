import os
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
import uvicorn
from pathlib import Path

app = FastAPI(title="AutoFilm AI: LTX-2.3 Sidecar")

# ---------------------------------------------------------------------------
# Model state — loaded once on first request (lazy) to keep startup fast
# ---------------------------------------------------------------------------
_pipeline = None
MODEL_DIR = Path(__file__).parent / "models" / "ltx-2.3"

def _load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline

    if not MODEL_DIR.exists():
        raise RuntimeError(
            f"LTX-2.3 weights not found at {MODEL_DIR}. "
            "Run 'python setup.py' first, or let the app use its FFmpeg Neural Fallback."
        )

    print("[LTX-2.3] Loading pipeline from local weights…")
    from diffusers import LTXPipeline  # diffusers >= 0.30 ships LTX support
    import torch

    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    device = "cuda" if torch.cuda.is_available() else "cpu"

    pipe = LTXPipeline.from_pretrained(str(MODEL_DIR), torch_dtype=dtype)
    pipe.to(device)

    # Memory optimisations — safe to call even if already enabled
    if torch.cuda.is_available():
        pipe.enable_model_cpu_offload()
        try:
            pipe.vae.enable_tiling()
        except AttributeError:
            pass

    _pipeline = pipe
    print(f"[LTX-2.3] Pipeline ready on {device}.")
    return _pipeline


# ---------------------------------------------------------------------------
# Request / response schemas
# ---------------------------------------------------------------------------

class GenerationRequest(BaseModel):
    prompt: str
    audio_prompt: str = ""
    duration: int = 5
    width: int = 1920
    height: int = 1080
    num_inference_steps: int = 40
    guidance_scale: float = 7.5


class VideoRequest(BaseModel):
    image_path: str
    prompt: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.head("/generate-av")
@app.get("/generate-av")
async def probe_av():
    return {"status": "ready", "model_loaded": MODEL_DIR.exists()}


@app.post("/generate-av")
async def generate_av(request: GenerationRequest):
    request_id = str(uuid.uuid4())
    print(f"[LTX-2.3] Synthesis request {request_id}")

    try:
        pipe = _load_pipeline()
    except RuntimeError as e:
        # Weights missing — tell Next.js to use the FFmpeg fallback
        raise HTTPException(status_code=503, detail=str(e))

    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / f"scene_{request_id}.mp4"

    try:
        result = pipe(
            prompt=request.prompt,
            width=request.width,
            height=request.height,
            num_frames=int(request.duration * 24),   # 24 fps
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
        )

        # Export frames to mp4 via imageio / torchvision
        frames = result.frames[0]  # list of PIL Images
        import imageio
        writer = imageio.get_writer(str(output_path), fps=24, quality=9)
        for frame in frames:
            import numpy as np
            writer.append_data(np.array(frame))
        writer.close()

        print(f"[LTX-2.3] Scene written to {output_path}")
        return {"status": "success", "file_path": str(output_path.resolve()), "request_id": request_id}

    except Exception as e:
        print(f"[LTX-2.3] Synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.head("/generate-video")
@app.get("/generate-video")
async def probe_video():
    return {"status": "ready", "model_loaded": MODEL_DIR.exists()}


@app.post("/generate-video")
async def generate_video(request: VideoRequest):
    """Image-to-video endpoint used by the engine's secondary sidecar check."""
    request_id = str(uuid.uuid4())
    print(f"[LTX-2.3] Image-to-video request {request_id}")

    try:
        pipe = _load_pipeline()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    output_dir = Path("outputs")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / f"scene_{request_id}.mp4"

    try:
        from PIL import Image
        image = Image.open(request.image_path).convert("RGB")

        result = pipe(
            prompt=request.prompt,
            image=image,
            num_frames=120,   # 5 s @ 24 fps
            num_inference_steps=40,
            guidance_scale=7.5,
        )

        frames = result.frames[0]
        import imageio, numpy as np
        writer = imageio.get_writer(str(output_path), fps=24, quality=9)
        for frame in frames:
            writer.append_data(np.array(frame))
        writer.close()

        return {"status": "success", "video_path": str(output_path.resolve()), "request_id": request_id}

    except Exception as e:
        print(f"[LTX-2.3] Image-to-video failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("LTX_PORT", 8081))
    print(f"[LTX-2.3] Sidecar starting on port {port}")
    print(f"[LTX-2.3] Model weights present: {MODEL_DIR.exists()}")
    if not MODEL_DIR.exists():
        print("[LTX-2.3] Weights not found — run 'python setup.py' to download them.")
        print("[LTX-2.3] Starting anyway; the app will use its FFmpeg Neural Fallback.")
    uvicorn.run(app, host="0.0.0.0", port=port)
