// routes/sellerRouter.js
const express = require('express');
const sellerController = require('../controllers/sellerController');
const authMiddleware = require('../midleware/authMiddleware'); // Убедитесь что путь правильный

const router = express.Router();

// Публичные маршруты (не требуют авторизации)
router.get('/', sellerController.getAll);
router.get('/:id', sellerController.getSellerInfo);
router.get('/:sellerId/products', sellerController.getSellerProducts);

// Приватные маршруты (требуют авторизации)
router.post('/', authMiddleware, sellerController.create);
router.put('/:id', authMiddleware, sellerController.updateSeller);
router.delete('/:id', authMiddleware, sellerController.deleteSeller);

module.exports = router;