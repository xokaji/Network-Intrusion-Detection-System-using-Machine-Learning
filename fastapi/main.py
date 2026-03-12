from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from pathlib import Path

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

model = joblib.load(MODEL_DIR / "intrusion_model.pkl")
scaler = joblib.load(MODEL_DIR / "scaler.pkl")


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

    prediction = model.predict(features_scaled)[0]

    if prediction == 1:
        status = "MALICIOUS"
        risk = "HIGH"
    else:
        status = "NORMAL"
        risk = "LOW"

    return {
        "traffic_status": status,
        "risk_level": risk
    }