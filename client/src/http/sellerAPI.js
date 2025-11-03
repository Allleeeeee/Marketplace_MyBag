// http/sellerAPI.js
import { $authHost, $host } from "./index";

export const createSeller = async (sellerData) => {
    const { data } = await $authHost.post('api/seller', sellerData);
    return data;
};

export const getSellerByUserId = async (userId) => {
    try {
        const { data } = await $authHost.get(`api/seller/${userId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null; 
        }
        throw error;
    }
};

export const checkOrCreateSeller = async (userId, sellerName = 'Мой магазин') => {
    try {
        console.log('Checking seller for user:', userId);
        
        let seller = await getSellerByUserId(userId);
        
        if (!seller) {
            console.log('Seller not found, creating new one...');
            seller = await createSeller({
                name: sellerName,
                user_id: userId,
                description: 'Добро пожаловать в мой магазин!'
            });
            console.log('New seller created:', seller.id);
        } else {
            console.log('Existing seller found:', seller.id);
        }
        
        return seller;
    } catch (error) {
        console.error('Error in checkOrCreateSeller:', error);
        
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Ошибка при создании профиля продавца');
    }
};

// http/sellerAPI.js
export const getAllSellers = async (params = {}) => {
    try {
        console.log('Making API request to sellers with params:', params);
        const { data } = await $host.get('api/seller', { params });
        console.log('API response data:', data);
        return data;
    } catch (error) {
        console.error('API Error in getAllSellers:', error);
        console.error('Error response:', error.response);
        throw error;
    }
};

export const getSellerById = async (sellerId) => {
    const { data } = await $host.get(`api/seller/${sellerId}`);
    return data;
};

export const getSellerProducts = async (sellerId) => {
    const { data } = await $host.get(`api/seller/${sellerId}/products`);
    return data;
};

export const updateSeller = async (sellerId, sellerData) => {
    const { data } = await $authHost.put(`api/seller/${sellerId}`, sellerData);
    return data;
};

export const deleteSeller = async (sellerId) => {
    const { data } = await $authHost.delete(`api/seller/${sellerId}`);
    return data;
};