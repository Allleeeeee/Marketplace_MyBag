// http/reviewAPI.js
import { $authHost, $host } from "./index";

export const createReview = async (reviewData) => {
    const { data } = await $authHost.post('api/review', reviewData);
    return data;
};

export const deleteReview = async (reviewId) => {
    const { data } = await $authHost.delete(`api/review/${reviewId}`);
    return data;
};

export const getReviewsBySeller = async (sellerId) => {
    const { data } = await $host.get(`api/review/seller/${sellerId}`);
    return data;
};

export const getReviewsByUser = async (userId) => {
    const { data } = await $host.get(`api/review/user/${userId}`);
    return data;
};

export const updateReview = async (reviewId, reviewData) => {
    const { data } = await $authHost.put(`api/review/${reviewId}`, reviewData);
    return data;
};