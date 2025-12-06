const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../midleware/authMiddleware')
const adminMiddleware = require('../midleware/adminMiddleware') 


router.post('/registration', userController.registration)
router.post('/login',userController.login )
router.get('/auth', authMiddleware, userController.check)

router.get('/:id', userController.getUserInfo);
router.put('/:id', userController.updateUser);

//router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers)
router.put('/:id/block', authMiddleware, adminMiddleware, userController.blockUser)
router.put('/:id/unblock', authMiddleware, adminMiddleware, userController.unblockUser)

router.get('/admin/all', authMiddleware, adminMiddleware, userController.getAllUsers)
module.exports = router