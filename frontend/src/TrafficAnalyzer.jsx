import React, { useState } from "react";
import { analyzeTraffic } from "./api";
import "./styles.css";

export default function TrafficAnalyzer() {

  const [form, setForm] = useState({
    Flow_Duration: "",
    Total_Fwd_Packets: "",
    Total_Backward_Packets: "",
    Flow_Bytes_s: "",
    Flow_Packets_s: "",
    Packet_Length_Mean: ""
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    const data = await analyzeTraffic(form);
    setResult(data);
  };

  return (
    <div className="container">

      <h1>Network Intrusion Detection</h1>

      <div className="card">

        <input name="Flow_Duration" placeholder="Flow Duration" onChange={handleChange}/>
        <input name="Total_Fwd_Packets" placeholder="Total Fwd Packets" onChange={handleChange}/>
        <input name="Total_Backward_Packets" placeholder="Total Backward Packets" onChange={handleChange}/>
        <input name="Flow_Bytes_s" placeholder="Flow Bytes/s" onChange={handleChange}/>
        <input name="Flow_Packets_s" placeholder="Flow Packets/s" onChange={handleChange}/>
        <input name="Packet_Length_Mean" placeholder="Packet Length Mean" onChange={handleChange}/>

        <button onClick={handleSubmit}>
            Analyze Traffic
        </button>

      </div>

      {result && (

        <div className="result">

          <h2>Status: {result.traffic_status}</h2>
          <p>Risk Level: {result.risk_level}</p>

        </div>

      )}

    </div>
  );
}