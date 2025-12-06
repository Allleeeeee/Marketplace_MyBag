// routes/reviewRouter.js
const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/reviewController');

router.post('/', ReviewController.create);
router.delete('/:id', ReviewController.delete);
router.get('/seller/:sellerId', ReviewController.getBySeller);
router.get('/user/:userId', ReviewController.getByUser);
router.get('/:id', ReviewController.getById); // Добавляем новый endpoint

module.exports = router;