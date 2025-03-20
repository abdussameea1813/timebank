import axios from 'axios';

const API_URL = '/api/auth'; // Relative URL

const signup = async (userData: any) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, userData);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error: any) {
        console.error('Signup error:', error.response ? error.response.data : error);
        throw error;
    }
};

const login = async (userData: any) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error: any) {
        console.error('Login error:', error.response ? error.response.data : error);
        throw error;
    }
};

const getProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found, please log in.');
    }

    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Get Profile error:', error.response ? error.response.data : error);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
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
    updateUserProfile,
};

export default authService;