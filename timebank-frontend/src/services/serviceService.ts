import axios from 'axios';

const API_URL = '/api/services'; // Relative URL

const getServices = async (params: any, token: string | null) => {
    const response = await axios.get(API_URL, {
        params,
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    });
    return response.data;
};

const getServiceById = async (id: string, token: string | null) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};

const createService = async (serviceData: any, token: string) => {
    const response = await axios.post(API_URL, serviceData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const updateService = async (id: string, serviceData: any, token: string) => {
    const response = await axios.put(`${API_URL}/${id}`, serviceData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const deleteService = async (id: string, token: string) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getUserServices = async (token: string) => {
    const response = await axios.get(`${API_URL}/user/myservices`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const serviceService = {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getUserServices,
};

export default serviceService;