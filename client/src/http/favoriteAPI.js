// http/favoriteAPI.js
import { $authHost } from "./index";

export const addToFavorite = async (userId, productId) => {
    const { data } = await $authHost.post('api/favorite', { userId, productId });
    return data;
};

export const removeFromFavorite = async (favoriteId) => {
    const { data } = await $authHost.delete(`api/favorite/${favoriteId}`);
    return data;
};

export const getUserFavorites = async (userId) => {
    const { data } = await $authHost.get(`api/favorite/${userId}`);
    return data;
};