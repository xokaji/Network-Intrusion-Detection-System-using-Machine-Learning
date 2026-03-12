from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

model = joblib.load(MODEL_DIR / "intrusion_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler.pkl")
label_classes_path = MODEL_DIR / "label_classes.pkl"
label_classes = joblib.load(label_classes_path) if label_classes_path.exists() else ["BENIGN"]


class TrafficData(BaseModel):

    Flow_Duration: float
    Total_Fwd_Packets: float
    Total_Backward_Packets: float
    Flow_Bytes_s: float
    Flow_Packets_s: float
    Packet_Length_Mean: float


@app.get("/")
def home():
    return {"message": "Intrusion Detection API Running"}


@app.post("/predict")
def predict(data: TrafficData):

    features = np.array([[
        data.Flow_Duration,
        data.Total_Fwd_Packets,
        data.Total_Backward_Packets,
        data.Flow_Bytes_s,
        data.Flow_Packets_s,
        data.Packet_Length_Mean
    ]])

    features_scaled = scaler.transform(features)

    prediction = int(model.predict(features_scaled)[0])
    predicted_label = label_classes[prediction] if prediction < len(label_classes) else str(prediction)
    probability = float(model.predict_proba(features_scaled)[0][prediction])

    if predicted_label != "BENIGN":
        status = "MALICIOUS"
        risk = "HIGH"
    else:
        status = "NORMAL"
        risk = "LOW"

    return {
        "predicted_label": predicted_label,
        "traffic_status": status,
        "risk_level": risk,
        "confidence": round(probability * 100, 2)
    }