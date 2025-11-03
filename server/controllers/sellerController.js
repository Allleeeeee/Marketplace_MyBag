// controllers/sellerController.js
const ApiError = require('../error/ApiError');
const { Seller, Product, ProductInfo, Type } = require('../models/models');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { Op } = require('sequelize');

class SellerController {
    async create(req, res, next) {
        try {
            const { name, description, user_id } = req.body;
            
            console.log('Creating seller with data:', { name, user_id });

            if (!name || !user_id) {
                return next(ApiError.badRequest('Необходимы поля: name и user_id'));
            }

            const existingSeller = await Seller.findOne({ where: { user_id } });
            if (existingSeller) {
                console.log('Seller already exists for user:', user_id);
                return res.json(existingSeller);
            }

            const staticDir = path.resolve(__dirname, '..', 'static');
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            let img = null;
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

  // controllers/sellerController.js
async getAll(req, res, next) {
    try {
        let { limit, page, city } = req.query;
        page = page || 1;
        limit = limit || 12;
        let offset = page * limit - limit;

        let whereClause = {};

        if (city) {
            const sellersWithProductsInCity = await Product.findAll({
                where: { city },
                attributes: ['seller_id'],
                group: ['seller_id'],
                raw: true
            });
            
            const sellerIds = sellersWithProductsInCity.map(item => item.seller_id);
            if (sellerIds.length > 0) {
                whereClause.id = sellerIds;
            } else {
                // Если нет продавцов в этом городе, возвращаем пустой список
                return res.json({
                    rows: [],
                    count: 0,
                    currentPage: parseInt(page),
                    totalPages: 0
                });
            }
        }

        const sellers = await Seller.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const sellersWithFullUrls = sellers.rows.map(seller => {
            const sellerData = seller.toJSON();
            if (sellerData.img) {
                sellerData.img = `${req.protocol}://${req.get('host')}/static/${sellerData.img}`;
            }
            return sellerData;
        });

        return res.json({
            rows: sellersWithFullUrls,
            count: sellers.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(sellers.count / limit)
        });
    } catch (e) {
        console.error('Get all sellers error:', e);
        next(ApiError.internal('Ошибка при получении списка продавцов'));
    }
}

    async getSellerInfo(req, res, next) {
        const { id } = req.params;
        try {
            const seller = await Seller.findOne({ where: { id } });
            if (!seller) {
                return next(ApiError.notFound('Продавец не найден'));
            }
            
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

    async getByUserId(req, res, next) {
        const { userId } = req.params;
        try {
            const seller = await Seller.findOne({ where: { user_id: userId } });
            if (!seller) {
                return next(ApiError.notFound('Продавец не найден'));
            }
            
            const sellerData = seller.toJSON();
            if (sellerData.img) {
                sellerData.img = `${req.protocol}://${req.get('host')}/static/${sellerData.img}`;
            }
            
            return res.json(sellerData);
        } catch (e) {
            console.error('Get seller by user id error:', e);
            next(ApiError.internal('Ошибка при получении информации о продавце'));
        }
    }

    async getSellerProducts(req, res, next) {
        const { sellerId } = req.params;
        try {
            const products = await Product.findAll({
                where: { seller_id: sellerId },
                include: [
                    { model: ProductInfo, as: 'info' },
                    { model: Type, attributes: ['id', 'name'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            const productsWithFullUrls = products.map(product => {
                const productData = product.toJSON();
                if (productData.img) {
                    productData.img = `${req.protocol}://${req.get('host')}/static/${productData.img}`;
                }
                return productData;
            });

            return res.json(productsWithFullUrls);
        } catch (e) {
            console.error('Get seller products error:', e);
            next(ApiError.internal('Ошибка при получении товаров продавца'));
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

            const staticDir = path.resolve(__dirname, '..', 'static');
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            if (req.files && req.files.img) {
                const uploadedImg = req.files.img;
                
                if (!uploadedImg.mimetype.startsWith('image/')) {
                    return next(ApiError.badRequest('Можно загружать только изображения'));
                }

                const fileExtension = path.extname(uploadedImg.name);
                const fileName = uuidv4() + fileExtension;
                const filePath = path.join(staticDir, fileName);

                await uploadedImg.mv(filePath);
                console.log('File saved to:', filePath);
                
                img = fileName;

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

            await seller.update({
                name: name || seller.name,
                description: description || seller.description,
                img: img
            });

            const updatedSeller = await Seller.findOne({ where: { id } });
            const sellerData = updatedSeller.toJSON();
            
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