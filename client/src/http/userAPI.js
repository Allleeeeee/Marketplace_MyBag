import { $authHost, $host } from "./index";
import { jwtDecode } from "jwt-decode"; 

import axios from 'axios';

const API_URL = 'http://your-api-url'; 
// http/userAPI.js
export const registration = async (email, password) => {
    const { data } = await $host.post('api/user/registration', {
        username: 'new user',
        email, 
        password
    });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); // Возвращает {id, email, role}
}

export const login = async (email, password) => {
    const { data } = await $host.post('api/user/login', { email, password });
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); // Возвращает {id, email, role}
}

export const check = async () => {
    const { data } = await $authHost.get('api/user/auth');
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token); // Возвращает {id, email, role}
}


export const getUserInfo = async (userId) => {
    const { data } = await $authHost.get(`api/user/${userId}`);
    return data;
};

export const getSellerInfo = async (sellerId) => {
    const { data } = await $authHost.get(`api/seller/${sellerId}`);
    console.log('sosti' + JSON.stringify(data));
    return data;
};


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
// Получить всех пользователей (для админа)
export const getAllUsers = async () => {
    const { data } = await $authHost.get('api/user/admin/all');
    return data;
};

// Блокировать пользователя
export const blockUser = async (userId) => {
    const { data } = await $authHost.put(`api/user/${userId}/block`);
    return data;
};

// Разблокировать пользователя
export const unblockUser = async (userId) => {
    const { data } = await $authHost.put(`api/user/${userId}/unblock`);
    return data;
};


// Получить товары продавца
export const getSellerProducts = async (sellerId) => {
    const { data } = await $authHost.get(`api/seller/${sellerId}/products`);
    return data;
};