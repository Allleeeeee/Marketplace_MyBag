const Router = require('express')
const router = new Router()
const typeController = require('../controllers/typeController')
const checkRole = require('../midleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), typeController.create)
router.get('/', typeController.getAll)
router.get('/:id', typeController.getOne)
router.delete('/:id', typeController.delete)
module.exports = router