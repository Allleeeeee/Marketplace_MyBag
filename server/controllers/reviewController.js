const { Review, Seller } = require('../models/models'); 
const ApiError = require('../error/ApiError'); 

class reviewController {
   
    create = async (req, res, next) => {
        const { sellerId, userId, rating, comment, imageUrl } = req.body; 
        try {
            const review = await Review.create({
                seller_id: sellerId,
                user_id: userId,
                rating,
                comment,
                image_url: imageUrl
            });

            await this.updateSellerRating(sellerId);

            return res.json(review); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при добавлении отзыва')); 
        }
    };

    async delete(req, res, next) {
        const { id } = req.params; 
        try {
            const review = await Review.findOne({ where: { id } }); 
            if (!review) {
                return next(ApiError.badRequest('Отзыв не найден')); 
            }

            await Review.destroy({ where: { id } }); 

            await this.updateSellerRating(review.seller_id);

            return res.json({ message: 'Отзыв удален' }); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при удалении отзыва')); 
        }
    }

    async updateSellerRating(sellerId) {
        try {
            const reviews = await Review.findAll({ where: { seller_id: sellerId } });
            if (reviews.length === 0) {
                await Seller.update({ rating: 0 }, { where: { id: sellerId } });
                return;
            }

            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviews.length;

            await Seller.update({ rating: averageRating }, { where: { id: sellerId } });
        } catch (e) {
            console.error(e); 
            throw new Error('Ошибка при обновлении рейтинга продавца'); 
        }
    }

    async getBySeller(req, res, next) {
        const { sellerId } = req.params; 
        try {
            const reviews = await Review.findAll({
                where: { seller_id: sellerId }
            });
            return res.json(reviews); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при получении отзывов')); 
        }
    }

    async getByUser(req, res, next) {
        const { userId } = req.params; 
        try {
            const reviews = await Review.findAll({
                where: { user_id: userId }
            });
            return res.json(reviews); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при получении отзывов')); 
        }
    }
}

module.exports = new reviewController();