import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getData = async () => {
  try {
    const response = await axios.get(`${API_URL}/data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    console.log("Fetching from:", `${API_URL}/user/profile`);
    const response = await fetch(`${API_URL}/user/profile`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
