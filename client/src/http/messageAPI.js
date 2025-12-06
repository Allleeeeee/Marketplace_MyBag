import { $authHost } from "./index";

export const getChats = async (userId) => {
    try {
        console.log('API: Получение чатов для пользователя', userId);
        const { data } = await $authHost.get(`/api/message/chats/${userId}`);
        console.log('API: Чаты получены', data.length);
        return data;
    } catch (error) {
        console.error('API Error getting chats:', error);
        throw error;
    }
};

export const getMessages = async (userId, otherUserId, productId = null) => {
    try {
        let url;
        if (productId && productId !== 0 && productId !== '0') {
            url = `/api/message/messages/${userId}/${otherUserId}/${productId}`;
        } else {
            url = `/api/message/messages/${userId}/${otherUserId}`;
        }
        console.log('API: Получение сообщений по URL:', url);
        const { data } = await $authHost.get(url);
        console.log('API: Сообщения получены', data.length);
        return data;
    } catch (error) {
        console.error('API Error getting messages:', error);
        throw error;
    }
};

export const sendMessage = async (messageData) => {
    try {
        console.log('API: Отправка сообщения', messageData);
        const { data } = await $authHost.post('/api/message/send', messageData);
        console.log('API: Сообщение отправлено успешно', data);
        return data;
    } catch (error) {
        console.error('API Error sending message:', error);
        console.error('Error details:', error.response?.data);
        throw error;
    }
};
// В http/messageAPI.js
export const markAsRead = async (markData) => {
    try {
        const { data } = await $authHost.post('/api/message/mark-read', markData);
        return data;
    } catch (error) {
        console.error('API Error marking as read:', error);
        throw error;
    }
};
export const getUnreadCount = async (userId) => {
    try {
        const { data } = await $authHost.get(`/api/message/unread/${userId}`);
        return data;
    } catch (error) {
        console.error('API Error getting unread count:', error);
        throw error;
    }
};