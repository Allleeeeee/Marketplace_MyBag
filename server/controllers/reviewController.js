const { Review, Seller } = require('../models/models'); 
const ApiError = require('../error/ApiError'); 

class reviewController {
   
    create = async (req, res, next) => {
        const { sellerId, userId, rating, comment, imageUrl } = req.body; 
        
        console.log('🔄 Создание отзыва с данными:', { sellerId, userId, rating, comment: comment?.substring(0, 50) + '...' });
        
        try {
            
            const existingReview = await Review.findOne({
                where: { 
                    user_id: userId,
                    seller_id: sellerId 
                }
            });

            if (existingReview) {
                console.log('❌ Отзыв уже существует:', existingReview.id);
                return next(ApiError.badRequest('Вы уже оставляли отзыв этому продавцу'));
            }

            console.log('✅ Проверка пройдена, создаем новый отзыв...');
            
            const review = await Review.create({
                seller_id: sellerId,
                user_id: userId,
                rating,
                comment,
                image_url: imageUrl
            });

            console.log('✅ Отзыв создан с ID:', review.id);

            // Фоновое обновление рейтинга (не блокируем ответ)
            this.updateSellerRating(sellerId).catch(e => {
                console.error('⚠️ Фоновая ошибка при обновлении рейтинга:', e.message);
            });

            return res.json(review); 
        } catch (e) {
            console.error('❌ Ошибка при создании отзыва:');
            console.error('Название ошибки:', e.name);
            console.error('Сообщение:', e.message);
            console.error('Детали:', e.errors || 'нет деталей');
            
            // Обрабатываем различные типы ошибок
            if (e.name === 'SequelizeUniqueConstraintError') {
                return next(ApiError.badRequest('Вы уже оставляли отзыв этому продавцу'));
            }
            
            if (e.name === 'SequelizeForeignKeyConstraintError') {
                return next(ApiError.badRequest('Продавец или пользователь не найден'));
            }
            
            if (e.name === 'SequelizeValidationError') {
                return next(ApiError.badRequest('Некорректные данные отзыва'));
            }
            
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

            const sellerId = review.seller_id;
           
            await Review.destroy({ where: { id } }); 
            
            this.updateSellerRating(sellerId).catch(e => {
                console.error('Фоновая ошибка при обновлении рейтинга:', e.message);
            });

            return res.json({ message: 'Отзыв удален' }); 
        } catch (e) {
            console.error('Ошибка при удалении отзыва:', e);
            next(ApiError.internal('Ошибка при удалении отзыва')); 
        }
    }

    async updateSellerRating(sellerId) {
        try {
            console.log('Обновление рейтинга для продавца:', sellerId);
            
            const reviews = await Review.findAll({ where: { seller_id: sellerId } });
            console.log(`Найдено отзывов: ${reviews.length}`);
            
            let averageRating = 0;
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                averageRating = totalRating / reviews.length;
                console.log(` Средний рейтинг: ${averageRating.toFixed(2)}`);
            }

            const [affectedRows] = await Seller.update(
                { rating: averageRating }, 
                { where: { id: sellerId } }
            );
            
            console.log(` Рейтинг продавца ${sellerId} обновлен: ${averageRating.toFixed(2)} (затронуто строк: ${affectedRows})`);
            return averageRating;
        } catch (e) {
            console.error(' Критическая ошибка при обновлении рейтинга продавца:', e.message);
                  }
    }

    async getBySeller(req, res, next) {
        const { sellerId } = req.params; 
        try {
            const reviews = await Review.findAll({
                where: { seller_id: sellerId },
                order: [['created_at', 'DESC']]
            });
            console.log(`📨 Отправлено отзывов для продавца ${sellerId}: ${reviews.length}`);
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
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
            console.log(`📨 Отправлено отзывов от пользователя ${userId}: ${reviews.length}`);
            return res.json(reviews); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при получении отзывов')); 
        }
    }

    async getById(req, res, next) {
        const { id } = req.params; 
        try {
            const review = await Review.findOne({ where: { id } }); 
            if (!review) {
                return next(ApiError.notFound('Отзыв не найден')); 
            }
            return res.json(review); 
        } catch (e) {
            console.error(e); 
            next(ApiError.internal('Ошибка при получении отзыва')); 
        }
    }
}

module.exports = new reviewController();