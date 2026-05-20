from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from prediction_service import PredictionInputError, load_model, predict_price


ROOT = Path(__file__).resolve().parent
MODEL_PATH = ROOT / "house_model.pkl"

app = FastAPI(title="HomeValuate AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    MODEL = load_model(MODEL_PATH)
except Exception:
    MODEL = None

app.mount("/assets", StaticFiles(directory=ROOT), name="assets")


@app.get("/")
def index():
    return FileResponse(ROOT / "index.html")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "backend": "fastapi",
        "model_loaded": MODEL is not None,
    }


@app.post("/api/predict")
async def api_predict(payload: dict):
    if MODEL is None:
        raise HTTPException(status_code=503, detail="Trained model is not loaded.")

    try:
        result = predict_price(payload, MODEL)
    except PredictionInputError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    return JSONResponse({"success": True, **result})


@app.get("/{filename:path}")
def static_passthrough(filename: str, request: Request):
    allowed = {"style.css", "app.js"}
    if filename in allowed:
        return FileResponse(ROOT / filename)
    raise HTTPException(status_code=404, detail="Not found")
