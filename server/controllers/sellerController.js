const ApiError = require('../error/ApiError');
const { Seller } = require('../models/models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class SellerController {
       async create(req, res, next) {
        try {
            const { name, description, user_id } = req.body;
            
            console.log('Creating seller with data:', { name, user_id });

            if (!name || !user_id) {
                return next(ApiError.badRequest('Необходимы поля: name и user_id'));
            }

            // Проверяем, не существует ли уже продавец для этого пользователя
            const existingSeller = await Seller.findOne({ where: { user_id } });
            if (existingSeller) {
                console.log('Seller already exists for user:', user_id);
                return res.json(existingSeller);
            }

            // Создаем папку static если ее нет
            const staticDir = path.resolve(__dirname, '..', 'static');
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            let img = null;
            // Обработка изображения если есть
            if (req.files && req.files.img) {
                const uploadedImg = req.files.img;
                if (uploadedImg.mimetype.startsWith('image/')) {
                    const fileExtension = path.extname(uploadedImg.name);
                    const fileName = uuidv4() + fileExtension;
                    const filePath = path.join(staticDir, fileName);
                    await uploadedImg.mv(filePath);
                    img = fileName;
                }
            }

            const seller = await Seller.create({
                name,
                description: description || `Магазин пользователя ${user_id}`,
                user_id,
                img
            });

            console.log('Seller created successfully:', seller.id);
            
            // Добавляем полный URL к изображению
            const sellerData = seller.toJSON();
            if (sellerData.img) {
                sellerData.img = `${req.protocol}://${req.get('host')}/static/${sellerData.img}`;
            }

            return res.json(sellerData);
        } catch (e) {
            console.error('Error creating seller:', e);
            
            if (e.name === 'SequelizeUniqueConstraintError') {
                return next(ApiError.badRequest('Продавец для этого пользователя уже существует'));
            }
            if (e.name === 'SequelizeForeignKeyConstraintError') {
                return next(ApiError.badRequest('Пользователь с указанным ID не существует'));
            }
            
            next(ApiError.internal('Ошибка при создании продавца'));
        }
    }
    async getSellerInfo(req, res, next) {
        const { id } = req.params;
        try {
            const seller = await Seller.findOne({ where: { user_id: id } });
            if (!seller) {
                return next(ApiError.notFound('Продавец не найден'));
            }
            
            // Добавляем полный URL к изображению
            const sellerData = seller.toJSON();
            if (sellerData.img) {
                sellerData.img = `${req.protocol}://${req.get('host')}/static/${sellerData.img}`;
            }
            
            return res.json(sellerData);
        } catch (e) {
            console.error('Get seller error:', e);
            next(ApiError.internal('Ошибка при получении информации о продавце'));
        }
    }

    async updateSeller(req, res, next) {
        const { id } = req.params;
        const { name, description } = req.body;
        let img;

        try {
            const seller = await Seller.findOne({ where: { id } });
            if (!seller) {
                return next(ApiError.notFound('Продавец не найден'));
            }

            // Создаем папку static если ее нет
            const staticDir = path.resolve(__dirname, '..', 'static');
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            // Обработка загруженного изображения
            if (req.files && req.files.img) {
                const uploadedImg = req.files.img;
                
                // Проверяем тип файла
                if (!uploadedImg.mimetype.startsWith('image/')) {
                    return next(ApiError.badRequest('Можно загружать только изображения'));
                }

                // Генерируем уникальное имя файла
                const fileExtension = path.extname(uploadedImg.name);
                const fileName = uuidv4() + fileExtension;
                const filePath = path.join(staticDir, fileName);

                // Перемещаем файл
                await uploadedImg.mv(filePath);
                console.log('File saved to:', filePath);
                
                img = fileName;

                // Удаляем старое изображение если оно есть
                if (seller.img) {
                    const oldFilePath = path.join(staticDir, seller.img);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                        console.log('Old file deleted:', oldFilePath);
                    }
                }
            } else {
                img = seller.img;
            }

            // Обновление данных продавца
            await seller.update({
                name: name || seller.name,
                description: description || seller.description,
                img: img
            });

            // Получаем обновленные данные
            const updatedSeller = await Seller.findOne({ where: { id } });
            const sellerData = updatedSeller.toJSON();
            
            // Добавляем полный URL к изображению
            if (sellerData.img) {
                sellerData.img = `${req.protocol}://${req.get('host')}/static/${sellerData.img}`;
            }

            console.log('Returning seller data:', sellerData);
            return res.json(sellerData);
        } catch (e) {
            console.error('Update seller error:', e);
            next(ApiError.internal('Ошибка при обновлении данных продавца'));
        }
    }

    async deleteSeller(req, res, next) {
        const { id } = req.params;
        try {
            const seller = await Seller.findOne({ where: { id } });
            if (!seller) {
                return next(ApiError.notFound('Продавец не найден'));
            }

            // Удаляем файл изображения если он есть
            if (seller.img) {
                const staticDir = path.resolve(__dirname, '..', 'static');
                const filePath = path.join(staticDir, seller.img);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            await Seller.destroy({ where: { id } });
            return res.json({ message: 'Продавец удален' });
        } catch (e) {
            console.error('Delete seller error:', e);
            next(ApiError.internal('Ошибка при удалении продавца'));
        }
    }
}

module.exports = new SellerController();