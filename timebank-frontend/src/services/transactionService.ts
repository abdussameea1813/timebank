import axios from 'axios';

const API_URL = 'http://localhost:9000/api/transaction';

const createTransaction = async (transactionData: any, token: string) => {
  const response = await axios.post(API_URL, transactionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getUserTransactions = async (token: string) => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const getTransactionById = async (id: string, token: string) => {
    console.log("Sending request with token:", token); // Debugging
  
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    return response.data;
  };
  

  const updateTransactionStatus = async (transactionId: string, status: string, token: string) => {
    try {
        const response = await axios.put(`${API_URL}/${transactionId}/status`, { status }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getTransactionStats = async (token: string) => {
    const response = await axios.get(`${API_URL}/stats`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};

const transactionService = {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransactionStatus,
  getTransactionStats,
};

export default transactionService;