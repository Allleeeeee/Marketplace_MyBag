const { Favorite, Product } = require('../models/models'); // Импортируем модели
const ApiError = require('../error/ApiError'); // Импортируем ApiError

class FavoriteController {
    // Метод для получения всех избранных товаров для определенного пользователя
    async getAll(req, res, next) {
        const { userId } = req.params; // Получаем userId из параметров запроса
        try {
            const favorites = await Favorite.findAll({
                where: { user_id: userId },
                include: [{ model: Product }] // Включаем информацию о продукте
            });
            return res.json(favorites);
        } catch (e) {
            next(ApiError.internal('Ошибка при получении избранного')); // Обрабатываем ошибки
        }
    }

    // Метод для удаления избранного товара по ID
    async delete(req, res, next) {
        const { id } = req.params; // Получаем id из параметров запроса
        try {
            const favorite = await Favorite.destroy({
                where: { id }
            });
            if (!favorite) {
                return next(ApiError.badRequest('Избранное не найдено')); // Обрабатываем ошибку, если не найдено
            }
            return res.json({ message: 'Избранное удалено' });
        } catch (e) {
            next(ApiError.internal('Ошибка при удалении избранного')); // Обрабатываем ошибки
        }
    }

    // Метод для добавления нового избранного товара
    async create(req, res, next) {
        const { userId, productId } = req.body; // Получаем userId и productId из тела запроса
        try {
            const favorite = await Favorite.create({
                user_id: userId,
                product_id: productId
            });
            return res.json(favorite);
        } catch (e) {
            next(ApiError.internal('Ошибка при добавлении избранного')); // Обрабатываем ошибки
        }
    }
}

module.exports = new FavoriteController();