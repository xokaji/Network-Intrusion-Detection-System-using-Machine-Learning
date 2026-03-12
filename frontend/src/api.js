import axios from "axios";

export const analyzeTraffic = async (data) => {

    const response = await axios.post(
        "http://localhost:8000/predict",
        data
    );

    return response.data;
};