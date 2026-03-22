import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://vasappbe.onrender.com/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to automatically inject the access token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Auth Endpoints ---

export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const activateAccount = async (email, otp) => {
    try {
        const response = await api.post('/auth/activate', { email, otp });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        console.log('Login request:', { email, password });
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.log('Login error:', error.message);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updatePushSubscription = async (subscription) => {
    try {
        const response = await api.patch('/auth/push-subscription', subscription);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const setPassword = async (data) => {
    try {
        const response = await api.post('/auth/set-password', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProfile = async () => {
    try {
        const response = await api.get('/auth/profile');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Group Endpoints ---

export const createGroup = async (groupData) => {
    try {
        const response = await api.post('/group/create', groupData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getGroup = async (groupId) => {
    const response = await api.get('/group', {
        params: { groupId }
    });
    return response.data;
};

export const getGroupMembers = async (groupId) => {
    try {
        const response = await api.get('/group/members', {
            params: { groupId }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const verifyInvitation = async (token) => {
    try {
        const response = await api.get(`/group/invite/verify/${token}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const acceptInvitation = async (data) => {
    try {
        const response = await api.post('/group/invite/accept', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addGroupMember = async (memberData) => {
    try {
        const response = await api.post('/group/member/add', memberData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateMemberLimit = async (limitData) => {
    try {
        const response = await api.patch('/group/member/limit', limitData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Wallet Endpoints ---

export const initializeFunding = async (amountData) => {
    try {
        const response = await api.post('/wallet/fund/init', amountData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getWalletBalance = async (groupId) => {
    try {
        const response = await api.get('/wallet/balance', {
            params: { groupId }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Purchase Endpoints ---

export const buyService = async (purchaseData) => {
    try {
        const response = await api.post('/purchase/buy', purchaseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Utility Endpoints ---

export const getNetworks = async (type) => {
    try {
        const response = await api.get('/utility/networks', {
            params: { type }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getDataPlans = async (networkId) => {
    try {
        const response = await api.get('/utility/data-plans', {
            params: { networkId }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCableProviders = async () => {
    try {
        const response = await api.get('/utility/cable-providers');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getElectricityPlans = async () => {
    try {
        const response = await api.get('/utility/electricity-plans');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const verifyIUC = async (identifier, iuc) => {
    try {
        const response = await api.get('/utility/verify-iuc', {
            params: { identifier, iuc }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const verifyMeter = async (plan, meter, type) => {
    try {
        const response = await api.get('/utility/verify-meter', {
            params: { plan, meter, type }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Transaction Endpoints ---

export const getTransactions = async (params = {}) => {
    try {
        const response = await api.get('/transaction', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Beneficiary Endpoints ---

export const addBeneficiary = async (beneficiaryData) => {
    try {
        const response = await api.post('/beneficiary', beneficiaryData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getBeneficiaries = async () => {
    try {
        const response = await api.get('/beneficiary');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteBeneficiary = async (id) => {
    try {
        const response = await api.delete(`/beneficiary/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
