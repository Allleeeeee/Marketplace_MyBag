
import { $authHost } from "./index";

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