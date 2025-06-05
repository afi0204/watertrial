import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Configure in .env

export const fetchMeters = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/meters`);
        return response.data;
    } catch (error) {
        console.error("Error fetching meters:", error);
        throw error;
    }
};

export const fetchMeterHistory = async (meterId, days = 30) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/meter/${meterId}/history?days=${days}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching history for meter ${meterId}:`, error);
        throw error;
    }
};