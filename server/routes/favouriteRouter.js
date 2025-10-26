const Router = require('express')
const router = new Router()
const favouriteController = require('../controllers/favouriteController')


router.get('/:userId', favouriteController.getAll);
router.delete('/:id', favouriteController.delete);
router.post('/', favouriteController.create);

module.exports = router