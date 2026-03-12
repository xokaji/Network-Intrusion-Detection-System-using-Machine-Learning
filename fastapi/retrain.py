import pandas as pd
import numpy as np
import glob
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import f1_score

FEATURES = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Packet Length Mean",
]

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

print("Loading data...")
files = glob.glob(str(DATA_DIR / "*.csv"))
df_list = []
for f in files:
    data = pd.read_csv(f)
    data.columns = data.columns.str.strip()
    df_list.append(data)

df = pd.concat(df_list, ignore_index=True)
df = df.sample(20000, random_state=42)

df.replace([np.inf, -np.inf], np.nan, inplace=True)
df.dropna(subset=FEATURES + ["Label"], inplace=True)

df["BinaryLabel"] = (df["Label"].str.strip() != "BENIGN").astype(int)

X = df[FEATURES]
y = df["BinaryLabel"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("Training XGBoost model...")
model = XGBClassifier(eval_metric="logloss")
model.fit(X_train_scaled, y_train)

preds = model.predict(X_test_scaled)
f1 = f1_score(y_test, preds)
print(f"F1 Score: {f1:.4f}")

joblib.dump(model, MODEL_DIR / "intrusion_model.pkl")
joblib.dump(scaler, MODEL_DIR / "scaler.pkl")
joblib.dump(["BENIGN", "MALICIOUS"], MODEL_DIR / "label_classes.pkl")
print(f"Model and scaler saved to {MODEL_DIR}")
