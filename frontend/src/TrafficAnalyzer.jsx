import React, { useState } from "react";
import { analyzeTraffic } from "./api";
import "./styles.css";

const initialForm = {
  Flow_Duration: "",
  Total_Fwd_Packets: "",
  Total_Backward_Packets: "",
  Flow_Bytes_s: "",
  Flow_Packets_s: "",
  Packet_Length_Mean: ""
};

const fields = [
  {
    name: "Flow_Duration",
    label: "Flow Duration",
    unit: "microseconds",
    placeholder: "1000000"
  },
  {
    name: "Total_Fwd_Packets",
    label: "Forward Packets",
    unit: "packets",
    placeholder: "10"
  },
  {
    name: "Total_Backward_Packets",
    label: "Backward Packets",
    unit: "packets",
    placeholder: "8"
  },
  {
    name: "Flow_Bytes_s",
    label: "Flow Bytes/s",
    unit: "bytes per second",
    placeholder: "1500"
  },
  {
    name: "Flow_Packets_s",
    label: "Flow Packets/s",
    unit: "packets per second",
    placeholder: "18"
  },
  {
    name: "Packet_Length_Mean",
    label: "Packet Length Mean",
    unit: "bytes",
    placeholder: "512"
  }
];

const presets = {
  normal: {
    Flow_Duration: "1000000",
    Total_Fwd_Packets: "10",
    Total_Backward_Packets: "8",
    Flow_Bytes_s: "1500",
    Flow_Packets_s: "18",
    Packet_Length_Mean: "512"
  },
  attack: {
    Flow_Duration: "12611",
    Total_Fwd_Packets: "10",
    Total_Backward_Packets: "6",
    Flow_Bytes_s: "1151059",
    Flow_Packets_s: "1268.734",
    Packet_Length_Mean: "853.882353"
  }
};

function validateForm(values) {
  return fields.reduce((errors, field) => {
    const rawValue = values[field.name];

    if (rawValue === "") {
      errors[field.name] = "This field is required.";
      return errors;
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
      errors[field.name] = "Enter a valid number.";
      return errors;
    }

    if (numericValue < 0) {
      errors[field.name] = "Value must be zero or greater.";
    }

    return errors;
  }, {});
}

export default function TrafficAnalyzer() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handlePreset = (presetName) => {
    setForm(presets[presetName]);
    setErrors({});
    setRequestError("");
    setResult(null);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setRequestError("");
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setRequestError("");
      setResult(null);
      return;
    }

    setIsSubmitting(true);
    setRequestError("");

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [key, Number(value)])
      );

      const data = await analyzeTraffic(payload);
      setResult(data);
    } catch (error) {
      setResult(null);
      setRequestError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resultTone = result?.traffic_status === "MALICIOUS" ? "danger" : "safe";

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <main className="dashboard">
        <section className="hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Bandwidth Project</p>
            <h1>Intrusion Detection Console</h1>
            <p className="hero-text">
              Analyze traffic flow characteristics with a cleaner demo interface,
              stricter input validation, and one-click preset scenarios for viva use.
            </p>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Input Features</span>
              <strong>6</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Model Output</span>
              <strong>Risk Class</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Demo Ready</span>
              <strong>Normal / Attack</strong>
            </div>
          </div>
        </section>

        <section className="workspace-grid">
          <form className="panel form-panel" onSubmit={handleSubmit}>
            <div className="panel-header">
              <div>
                <p className="section-kicker">Traffic Profile</p>
                <h2>Enter network flow values</h2>
              </div>

              <div className="quick-actions">
                <button type="button" className="ghost-button" onClick={() => handlePreset("normal")}>
                  Load Normal
                </button>
                <button type="button" className="ghost-button" onClick={() => handlePreset("attack")}>
                  Load Attack
                </button>
              </div>
            </div>

            <div className="field-grid">
              {fields.map((field) => (
                <label
                  key={field.name}
                  className={`field-card ${errors[field.name] ? "field-card-error" : ""}`}
                >
                  <span className="field-label">{field.label}</span>
                  <span className="field-unit">{field.unit}</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name={field.name}
                    value={form[field.name]}
                    placeholder={field.placeholder}
                    onChange={handleChange}
                  />
                  <span className="field-error">{errors[field.name] || " "}</span>
                </label>
              ))}
            </div>

            {requestError && <div className="banner banner-error">{requestError}</div>}

            <div className="form-footer">
              <button type="button" className="secondary-button" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? "Analyzing..." : "Analyze Traffic"}
              </button>
            </div>
          </form>

          <aside className="panel insights-panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Prediction Result</p>
                <h2>Classification summary</h2>
              </div>
            </div>

            {result ? (
              <div className={`result-card result-${resultTone}`}>
                <p className="result-label">Traffic Status</p>
                <h3>{result.traffic_status}</h3>
                <div className="result-divider" />
                <p className="result-label">Predicted Class</p>
                <strong>{result.predicted_label}</strong>
                <div className="result-divider" />
                <p className="result-label">Confidence</p>
                <strong>{result.confidence}%</strong>
                <div className="result-divider" />
                <p className="result-label">Risk Level</p>
                <strong>{result.risk_level}</strong>
              </div>
            ) : (
              <div className="empty-state">
                <p>No prediction yet.</p>
                <span>
                  Fill the form manually or load one of the preset scenarios, then run the analysis.
                </span>
              </div>
            )}

            <div className="tips-card">
              <p className="section-kicker">Validation Rules</p>
              <ul>
                <li>All six fields are required.</li>
                <li>Only numeric values are accepted.</li>
                <li>Negative values are blocked before API submission.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}