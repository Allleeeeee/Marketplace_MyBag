const Router = require('express')
const router = new Router()
const productController = require('../controllers/productController')
const authMiddleware = require('../midleware/authMiddleware'); // Убедитесь что путь правильный


router.post('/', productController.create)
router.get('/', productController.getAll)
router.get('/types', productController.getTypes)
router.get('/cities', productController.getBelarusCities) 
router.get('/prod/:id', productController.getOne)
router.delete('/:id', productController.delete)
router.get('/cities/unique', productController.getUniqueCities) 
router.get('/city/:city', productController.getProductsByCity)
router.get('/geocode', productController.geocode)
router.get('/search', productController.search)
router.put('/:id', productController.update)
module.exports = router