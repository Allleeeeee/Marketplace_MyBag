const { Favorite, Product } = require('../models/models'); 
const ApiError = require('../error/ApiError'); 

class FavoriteController {
    async getAll(req, res, next) {
        const { userId } = req.params; 
        try {
            const favorites = await Favorite.findAll({
                where: { user_id: userId },
                include: [{ model: Product }] 
            });
            return res.json(favorites);
        } catch (e) {
            next(ApiError.internal('Ошибка при получении избранного')); 
        }
    }

    async delete(req, res, next) {
        const { id } = req.params; 
        try {
            const favorite = await Favorite.destroy({
                where: { id }
            });
            if (!favorite) {
                return next(ApiError.badRequest('Избранное не найдено')); 
            }
            return res.json({ message: 'Избранное удалено' });
        } catch (e) {
            next(ApiError.internal('Ошибка при удалении избранного')); 
        }
    }

    async create(req, res, next) {
        const { userId, productId } = req.body; 
        try {
            const favorite = await Favorite.create({
                user_id: userId,
                product_id: productId
            });
            return res.json(favorite);
        } catch (e) {
            next(ApiError.internal('Ошибка при добавлении избранного')); 
        }
    }
}

module.exports = new FavoriteController();