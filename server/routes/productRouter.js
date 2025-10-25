// routes/productRouter.js
const Router = require('express')
const router = new Router()
const productController = require('../controllers/productController')

router.post('/', productController.create)
router.get('/', productController.getAll)
router.get('/types', productController.getTypes)
router.get('/cities', productController.getBelarusCities) // Новый маршрут для городов
router.get('/prod/:id', productController.getOne)
router.delete('/:id', productController.delete)
router.get('/cities/unique', productController.getUniqueCities) // Старый маршрут переименован
router.get('/city/:city', productController.getProductsByCity)
router.get('/geocode', productController.geocode)
module.exports = router