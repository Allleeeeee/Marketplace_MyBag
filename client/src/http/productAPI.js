// http/productAPI.js
import {$authHost, $host} from "./index";

export const fetchProducts = async (typeId, brandId, page, limit) => {
    const { data } = await $host.get('api/prod');
    return data;
};


export const fetchOneProduct = async (id) => {
    const { data } = await $host.get(`api/prod/prod/${id}`);
    return data;
};

export const createProduct = async (productData) => {
    const { data } = await $authHost.post('api/prod', productData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

export const getTypes = async () => {
    const { data } = await $host.get('api/prod/types');
    return data;
};

export const getBelarusCities = async () => {
    const { data } = await $host.get('api/prod/cities');
    return data;
};