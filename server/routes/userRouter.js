const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../midleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login',userController.login )
router.get('/auth', authMiddleware, userController.check)

router.get('/:id', userController.getUserInfo);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router