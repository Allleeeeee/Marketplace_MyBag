const Router = require('express');
const router = new Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../midleware/authMiddleware');

// Правильные роуты без опциональных параметров
router.get('/chats/:userId', authMiddleware, messageController.getChats);
router.get('/messages/:userId/:otherUserId', authMiddleware, messageController.getMessages);
router.get('/messages/:userId/:otherUserId/:productId', authMiddleware, messageController.getMessages);
router.get('/unread/:userId', authMiddleware, messageController.getUnreadCount);
router.post('/send', authMiddleware, messageController.sendMessage);
router.post('/mark-read', authMiddleware, messageController.markAsRead);
module.exports = router;