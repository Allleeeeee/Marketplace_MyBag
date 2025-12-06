const { Message, User, Product, Seller } = require('../models/models');
const { Op } = require('sequelize');

class MessageController {
  
   async getChats(req, res) {
    try {
        const { userId } = req.params;
        
        console.log('Получение чатов для пользователя:', userId);
        const latestMessages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: parseInt(userId) },
                    { receiver_id: parseInt(userId) }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username', 'role'],
                    include: [{
                        model: Seller,
                        as: 'seller',
                        attributes: ['id', 'name', 'img']
                    }]
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'username', 'role'],
                    include: [{
                        model: Seller,
                        as: 'seller',
                        attributes: ['id', 'name', 'img']
                    }]
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'img']
                }
            ],
            order: [['timestamp', 'DESC']]
        });

        console.log('Найдено сообщений:', latestMessages.length);
        const chatMap = new Map();

        const unreadCounts = await Message.findAll({
            where: {
                receiver_id: parseInt(userId),
                is_read: false
            },
            attributes: [
                'sender_id',
                'receiver_id', 
                'product_id',
                [Message.sequelize.fn('COUNT', Message.sequelize.col('id')), 'unreadCount']
            ],
            group: ['sender_id', 'receiver_id', 'product_id']
        });
        const unreadMap = new Map();
        unreadCounts.forEach(item => {
            const key = `${item.sender_id}-${item.receiver_id}-${item.product_id || 0}`;
            unreadMap.set(key, item.dataValues.unreadCount);
        });

        latestMessages.forEach(message => {
            const otherUserId = message.sender_id === parseInt(userId) 
                ? message.receiver_id 
                : message.sender_id;
            
            const chatKey = `${Math.min(userId, otherUserId)}-${Math.max(userId, otherUserId)}-${message.product_id || 0}`;
            
            if (!chatMap.has(chatKey)) {
                const otherUser = message.sender_id === parseInt(userId) 
                    ? message.receiver 
                    : message.sender;
                
                const unreadKey = `${otherUserId}-${userId}-${message.product_id || 0}`;
                const unreadCount = unreadMap.get(unreadKey) || 0;
                
                chatMap.set(chatKey, {
                    otherUser: {
                        id: otherUser.id,
                        username: otherUser.username,
                        role: otherUser.role,
                        sellerInfo: otherUser.seller
                    },
                    product: message.product,
                    lastMessage: message.message,
                    lastMessageTime: message.timestamp,
                    unreadCount: parseInt(unreadCount)
                });
            }
        });

        const chats = Array.from(chatMap.values());
        console.log('Сформировано чатов:', chats.length);
        
        res.json(chats);
    } catch (error) {
        console.error('Error getting chats:', error);
        res.status(500).json({ message: 'Ошибка при получении чатов', error: error.message });
    }
}

    async getMessages(req, res) {
        try {
            const { userId, otherUserId, productId } = req.params;
            
            console.log('Получение сообщений:', { userId, otherUserId, productId });
            
            let whereCondition;
            if (productId && productId !== '0') {
                whereCondition = {
                    [Op.or]: [
                        {
                            sender_id: parseInt(userId),
                            receiver_id: parseInt(otherUserId),
                            product_id: parseInt(productId)
                        },
                        {
                            sender_id: parseInt(otherUserId),
                            receiver_id: parseInt(userId),
                            product_id: parseInt(productId)
                        }
                    ]
                };
            } else {
                whereCondition = {
                    [Op.or]: [
                        {
                            sender_id: parseInt(userId),
                            receiver_id: parseInt(otherUserId),
                            product_id: null
                        },
                        {
                            sender_id: parseInt(otherUserId),
                            receiver_id: parseInt(userId),
                            product_id: null
                        }
                    ]
                };
            }

            console.log('Условие поиска:', whereCondition);

            const messages = await Message.findAll({
                where: whereCondition,
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username', 'role']
                    },
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                ],
                order: [['timestamp', 'ASC']]
            });

            console.log('Найдено сообщений в истории:', messages.length);

            res.json(messages);
        } catch (error) {
            console.error('Error getting messages:', error);
            res.status(500).json({ message: 'Ошибка при получении сообщений', error: error.message });
        }
    }
    async sendMessage(req, res) {
        try {
            const { sender_id, receiver_id, product_id, message } = req.body;
            
            console.log('Получен запрос на отправку сообщения:', { sender_id, receiver_id, product_id, message });
            
            if (!sender_id || !receiver_id || !message) {
                return res.status(400).json({ message: 'Не все обязательные поля заполнены' });
            }

            const newMessage = await Message.create({
                sender_id: parseInt(sender_id),
                receiver_id: parseInt(receiver_id),
                product_id: product_id ? parseInt(product_id) : null,
                message: message.trim(),
                timestamp: new Date()
            });

            console.log('Сообщение создано в БД:', newMessage.id);

            const messageWithDetails = await Message.findByPk(newMessage.id, {
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'username', 'role']
                    },
                    {
                        model: Product,
                        as: 'product',
                        attributes: ['id', 'name']
                    }
                ]
            });

            console.log('Сообщение с деталями подготовлено для отправки');

            res.json(messageWithDetails);
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ message: 'Ошибка при отправке сообщения', error: error.message });
        }
    }

    async getUnreadCount(req, res) {
        try {
            const { userId } = req.params;
            
            const unreadCount = await Message.count({
                where: {
                    receiver_id: parseInt(userId),
                    is_read: false
                }
            });

            res.json({ unreadCount });
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ message: 'Ошибка при получении количества непрочитанных', error: error.message });
        }
    }
async markAsRead(req, res) {
    try {
        const { userId, otherUserId, productId = null } = req.body;
        
        await Message.update(
            { is_read: true },
            {
                where: {
                    sender_id: parseInt(otherUserId),
                    receiver_id: parseInt(userId),
                    product_id: productId ? parseInt(productId) : null,
                    is_read: false
                }
            }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Ошибка при обновлении статуса сообщений', error: error.message });
    }
}
}

module.exports = new MessageController();