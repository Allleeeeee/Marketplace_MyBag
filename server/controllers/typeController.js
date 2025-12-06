const { Type, Product } = require('../models/models');
const ApiError = require('../error/ApiError');

class TypeController {
    async create(req, res, next) {
        try {
            const { name } = req.body;
            
            if (!name) {
                return next(ApiError.badRequest('Название типа обязательно'));
            }

            const type = await Type.create({ name });
            return res.json(type);
        } catch (e) {
            console.error('Error creating type:', e);
            
            if (e.name === 'SequelizeUniqueConstraintError') {
                return next(ApiError.badRequest('Тип с таким названием уже существует'));
            }
            
            next(ApiError.internal('Ошибка при создании типа'));
        }
    }

    async getAll(req, res) {
        try {
            const types = await Type.findAll({
                order: [['name', 'ASC']]
            });
            return res.json(types);
        } catch (e) {
            console.error('Error getting types:', e);
            return res.status(500).json({ message: 'Ошибка при получении типов' });
        }
    }

    async getOne(req, res, next) {
        try {
            const { id } = req.params;
            const type = await Type.findOne({ where: { id } });
            
            if (!type) {
                return next(ApiError.notFound('Тип не найден'));
            }

            return res.json(type);
        } catch (e) {
            console.error('Error getting type:', e);
            next(ApiError.internal('Ошибка при получении типа'));
        }
    }

    async delete(req, res, next) {
        const transaction = await require('../db').transaction(); 
        
        try {
            const { id } = req.params;
            const type = await Type.findOne({ 
                where: { id },
                transaction 
            });
            
            if (!type) {
                await transaction.rollback();
                return next(ApiError.notFound('Тип не найден'));
            }
            const deletedProductsCount = await Product.destroy({ 
                where: { type_id: id },
                transaction 
            });

            const deletedType = await Type.destroy({ 
                where: { id },
                transaction 
            });

            await transaction.commit();

            return res.json({ 
                message: 'Тип и связанные товары успешно удалены',
                deletedType: true,
                deletedProductsCount: deletedProductsCount
            });
            
        } catch (e) {
               await transaction.rollback();
            console.error('Error deleting type:', e);
            next(ApiError.internal('Ошибка при удалении типа и связанных товаров'));
        }
    }
}

module.exports = new TypeController();