import os
import subprocess
import sys

def install_deps():
    print("[SETUP] Installing local neural dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", 
        "fastapi", "uvicorn", "pydantic", "torch", "torchvision",
        "diffusers>=0.30.0", "transformers", "accelerate",
        "huggingface_hub", "sentencepiece", "imageio[ffmpeg]", "Pillow"
    ])

def download_weights():
    print("[SETUP] Initializing LTX-2.3 (Apache 2.0) Local Weights...")
    print("WARNING: This will download approx 47GB. Ensure you have sufficient disk space.")
    
    from huggingface_hub import snapshot_download
    
    model_id = "lightricks/LTX-Video-2.3"
    target_dir = "models/ltx-2.3"
    
    if os.path.exists(target_dir):
        print(f"[SETUP] Weights already detected in {target_dir}. Skipping download.")
        return

    try:
        snapshot_download(
            repo_id=model_id,
            local_dir=target_dir,
            ignore_patterns=["*.msgpack", "*.h5", "*.tflite"]
        )
        print(f"[SETUP] Successfully materialized LTX-2.3 into {target_dir}")
    except Exception as e:
        print(f"[SETUP] Download failed: {str(e)}")
        print("Continuing... The app will use the high-fidelity 'Neural FFmpeg' fallback if local weights are missing.")

if __name__ == "__main__":
    install_deps()
    download_weights()
    print("\n[SUCCESS] Local Forge is ready. Run 'python main.py' to start the engine.")
