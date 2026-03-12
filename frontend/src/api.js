import axios from "axios";

export const analyzeTraffic = async (data) => {
    try {
        const response = await axios.post(
            "http://localhost:8000/predict",
            data
        );

        return response.data;
    } catch (error) {
        const message = error.response?.data?.detail || error.message || "Request failed.";
        throw new Error(message);
    }
};