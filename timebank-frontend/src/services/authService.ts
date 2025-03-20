import axios from 'axios';

const API_URL = 'http://localhost:9000/api/auth'; // Assuming your backend is on the same domain

// Signup function to register a user and store the token
const signup = async (userData: any) => { // Replace 'any' with your User type
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token); // Store token
    }
    return response.data;
  } catch (error: any) {
    console.error('Signup error:', error.response ? error.response.data : error);
    throw error; // Rethrow for handling where the function is called
  }
};

// Login function to authenticate a user and store the token
const login = async (userData: any) => { // Replace 'any' with your User type
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token); // Store token
    }
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error.response ? error.response.data : error);
    throw error; // Rethrow for handling where the function is called
  }
};

// Get the profile of the logged-in user using the token
const getProfile = async () => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  if (!token) {
    throw new Error('No token found, please log in.');
  }

  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // Use token in Authorization header
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Get Profile error:', error.response ? error.response.data : error);
    throw error; // Rethrow error if any
  }
};

// Logout function to remove token from localStorage
const logout = () => {
  localStorage.removeItem('token'); // Remove token from localStorage
};

const updateUserProfile = async (userData: any, token: string) => {
  try {
      const response = await axios.put(`${API_URL}/profile`, userData, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error: any) {
      throw error;
  }
};

const authService = {
  signup,
  login,
  getProfile,
  logout,
  updateUserProfile
};

export default authService;
