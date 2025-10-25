const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');

router.post('/', ReviewController.create);
// Удаление отзыва
router.delete('/:id', ReviewController.delete);
// Получение всех отзывов по seller_id
router.get('/seller/:sellerId', ReviewController.getBySeller);
// Получение всех отзывов по user_id
router.get('/user/:userId', ReviewController.getByUser);

module.exports = router;