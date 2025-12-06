const Router = require('express')
const router = new Router()
const typeController = require('../controllers/typeController')
const checkRole = require('../midleware/checkRoleMiddleware')

// Только ADMIN может создавать и удалять типы
router.post('/', checkRole('ADMIN'), typeController.create)
router.get('/', typeController.getAll) // Доступно всем
router.get('/:id', typeController.getOne) // Доступно всем
// Убираем put метод, если у вас нет update в контроллере
router.delete('/:id', checkRole('ADMIN'), typeController.delete)

module.exports = router