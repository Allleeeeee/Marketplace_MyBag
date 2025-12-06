const Router = require('express')
const router = new Router()
const deviceRouter = require('./deviceRouter')
const userRouter = require('./userRouter')
const brandRouter = require('./brandRouter')
const typeRouter = require('./typeRouter')
const productRouter = require('./productRouter')
const favouriteRouter = require('./favouriteRouter')
const reviewRouter = require('./reviewRouter')
const sellerRouter = require('./sellerRouter')
const messageRouter = require('./messageRoutes');

router.use('/user', userRouter) 
router.use('/type', typeRouter)
router.use('/brand', brandRouter)
router.use('/device', deviceRouter)
router.use('/prod', productRouter)
router.use('/favorite', favouriteRouter)
router.use('/review', reviewRouter)
router.use('/seller', sellerRouter)
router.use('/message', messageRouter);

module.exports = router