const Router = require('express')
const router = new Router()
const favouriteController = require('../controllers/favouriteController')


// Получение всех избранных товаров
router.get('/:userId', favouriteController.getAll);
// Удаление избранного товара
router.delete('/:id', favouriteController.delete);
// Добавление нового избранного товара
router.post('/', favouriteController.create);

module.exports = router