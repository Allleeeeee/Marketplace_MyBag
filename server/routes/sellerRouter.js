const express = require('express');

const sellerController = require('../controllers/sellerController');

const router = express.Router();


// Роуты
router.post('/', sellerController.create);
router.get('/:id', sellerController.getSellerInfo);
router.put('/:id', sellerController.updateSeller);
router.delete('/:id', sellerController.deleteSeller);

module.exports = router;