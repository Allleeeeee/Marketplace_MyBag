import { $authHost, $host } from "./index";

export const createType = async (name) => {
    console.log('Creating type with name:', name);
    // Отправляем объект с полем name, а не просто строку
    const { data } = await $authHost.post('api/type', { name });
    return data;
}

export const fetchTypes = async () => {
    const { data } = await $host.get('api/type');
    return data;
};

export const deleteType = async (id) => {
    const { data } = await $authHost.delete(`api/type/${id}`);
    return data;
};