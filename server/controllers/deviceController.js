const uuid = require('uuid')
const path = require('path');
const {Device, DeviceInfo} = require('../models/models')
const ApiError = require('../error/ApiError');

class DeviceController {
       async create(req, res, next) {
        try {
            let { name, price, seller_id, type_id, description, info } = req.body;
            
            // Проверка обязательных полей
            if (!name || !price || !seller_id || !type_id) {
                return next(ApiError.badRequest('Не указаны все обязательные поля'));
            }

            let fileName = null;
            if (req.files && req.files.img) {
                const { img } = req.files;
                fileName = uuid.v4() + ".jpg";
                await img.mv(path.resolve(__dirname, '..', 'static', fileName));
            }

            // Создаем продукт
            const product = await Product.create({ 
                name, 
                price, 
                seller_id, 
                type_id, 
                img: fileName,
                description
            });

            // Обработка дополнительной информации
            if (info) {
                try {
                    info = JSON.parse(info);
                    if (Array.isArray(info)) {
                        await Promise.all(info.map(i =>
                            Info.create({
                                title: i.title,
                                description: i.description,
                                productId: product.id
                            })
                        ));
                    }
                } catch (e) {
                    console.error('Ошибка при обработке info:', e);
                }
            }

            return res.json(product);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async getAll(req, res) {
        let {brandId, typeId, limit, page} = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit
        let devices;
        if (!brandId && !typeId) {
            devices = await Device.findAndCountAll({limit, offset})
        }
        if (brandId && !typeId) {
            devices = await Device.findAndCountAll({where:{brandId}, limit, offset})
        }
        if (!brandId && typeId) {
            devices = await Device.findAndCountAll({where:{typeId}, limit, offset})
        }
        if (brandId && typeId) {
            devices = await Device.findAndCountAll({where:{typeId, brandId}, limit, offset})
        }
        return res.json(devices)
    }

    async getOne(req, res) {
        const {id} = req.params
        const device = await Device.findOne(
            {
                where: {id},
                include: [{model: DeviceInfo, as: 'info'}]
            },
        )
        return res.json(device)
    }
}

module.exports = new DeviceController()