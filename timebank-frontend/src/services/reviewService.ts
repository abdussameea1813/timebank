import axios from 'axios';

const API_URL = '/api/review'; // Relative URL

const createReview = async (transactionId: string, rating: number, comment: string, token: string) => {
    const response = await axios.post(API_URL, { transactionId, rating, comment }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getReviewsByUser = async (userId: string, token: string) => {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getReviewsForUser = async (userId: string, token: string) => {
    const response = await axios.get(`${API_URL}/forUser/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const getReviewsByTransaction = async (transactionId: string, token: string) => {
    const response = await axios.get(`${API_URL}/transaction/${transactionId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

const reviewService = {
    createReview,
    getReviewsByUser,
    getReviewsForUser,
    getReviewsByTransaction,
};

export default reviewService;