import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const getStations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching stations:", error);
    throw error;
  }
};

export const getForecast = async (stationId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast/${stationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching forecast for ${stationId}:`, error);
    throw error;
  }
};
