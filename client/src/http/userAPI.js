import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode"; 

import axios from 'axios';

const API_URL = 'http://your-api-url'; 
export const registration = async (email, password) => {
    const { data } = await $host.post('api/user/registration', {
        username:'new user',
        email, 
        password, 
        role: 'ADMIN'
    });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); 
}

export const login = async (email, password) => {
    const { data } = await $host.post('api/user/login', { email, password });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); 
}

export const check = async () => {
    const { data } = await $authHost.get('api/user/auth');
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); 
}

export const getUserInfo = async (userId) => {
    const { data } = await $authHost.get(`api/user/${userId}`);
    return data;
};

export const getSellerInfo = async (sellerId) => {
    const { data } = await $authHost.get(`api/seller/${sellerId}`);
    return data;};


export const updateUser = async (userId, userData) => {
    const { data } = await $authHost.put(`api/user/${userId}`, userData);
    return data;
};


export const updateSeller = async (sellerId, sellerData) => {
    try {
        const response = await $authHost.put(`api/seller/${sellerId}`, sellerData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Update seller error:', error);
        throw error;
    }
};

export const updateSellerImage = async (id, formData) => {
    const { data } = await axios.put(`${API_URL}/seller/${id}/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};