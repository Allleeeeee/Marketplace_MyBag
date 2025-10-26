// controllers/productController.js
const { v4: uuidv4 } = require('uuid');  
const path = require('path');
const { Product, ProductInfo, Seller, Type } = require('../models/models');
const ApiError = require('../error/ApiError');
const sequelize = require('sequelize');
const { Op } = require('sequelize');

// Список городов Беларуси
const BELARUS_CITIES = [
    'Минск', 'Гомель', 'Могилёв', 'Витебск', 'Гродно', 'Брест',
    'Барановичи', 'Борисов', 'Пинск', 'Орша', 'Мозырь', 'Солигорск',
    'Новополоцк', 'Лида', 'Молодечно', 'Полоцк', 'Жлобин', 'Светлогорск',
    'Речица', 'Жодино', 'Слуцк', 'Кобрин', 'Волковыск', 'Калинковичи',
    'Сморгонь', 'Ошмяны', 'Рогачёв', 'Горки', 'Новогрудок', 'Вилейка',
    'Березино', 'Дзержинск', 'Ивацевичи', 'Лунинец', 'Поставы', 'Столбцы',
    'Щучин', 'Несвиж', 'Белоозёрск', 'Берёза', 'Микашевичи', 'Браслав',
    'Клецк', 'Ляховичи', 'Старые Дороги', 'Червень', 'Крупки', 'Узда',
    'Коссово', 'Мир', 'Негорелое', 'Ивье', 'Воложин', 'Дрогичин',
    'Ганцевичи', 'Пружаны', 'Шклов', 'Кировск', 'Островец', 'Чериков'
];

class ProductController {
    async create(req, res, next) {
        try {
            let { name, price, sellerId, typeId, city, info, priceType, priceText, currency } = req.body; 
            const { img } = req.files; 

            console.log('Creating product with data:', { 
                name, price, sellerId, typeId, city, priceType, priceText, currency 
            });

            // Проверка обязательных полей
            if (!name || !sellerId) {
                return next(ApiError.badRequest('Необходимы поля: название и ID продавца'));
            }

            if (!img) {
                return next(ApiError.badRequest('Изображение товара обязательно'));
            }

            // Проверяем город
            if (!city) {
                return next(ApiError.badRequest('Город обязателен'));
            }

            // Проверяем существование продавца
            const seller = await Seller.findOne({ where: { user_id: sellerId } });
            if (!seller) {
                return next(ApiError.badRequest(`Пользователь с ID ${sellerId} не зарегистрирован как продавец. Сначала создайте профиль продавца в личном кабинете.`));
            }

            // Проверяем существование типа товара
            let type = null;
            if (typeId) {
                type = await Type.findOne({ where: { id: typeId } });
                if (!type) {
                    return next(ApiError.badRequest(`Тип товара с ID ${typeId} не найден.`));
                }
            }

            // Если тип не указан, используем тип по умолчанию (другое)
            const finalTypeId = type ? type.id : 1;

            // Валидация типа цены
            const validPriceTypes = ['fixed', 'negotiable', 'custom'];
            const finalPriceType = validPriceTypes.includes(priceType) ? priceType : 'fixed';

            // Валидация валюты
            const validCurrencies = ['USD', 'EUR', 'BYN', 'RUB'];
            const finalCurrency = validCurrencies.includes(currency) ? currency : 'USD';

            let finalPrice = null;
            let finalPriceText = '';

            // Обработка цены в зависимости от типа
            if (finalPriceType === 'fixed') {
                if (!price || parseFloat(price) <= 0) {
                    return next(ApiError.badRequest('Для фиксированной цены необходимо указать положительное число'));
                }
                finalPrice = parseFloat(price);
                finalPriceText = `${finalPrice} ${finalCurrency}`;
            } else if (finalPriceType === 'negotiable') {
                finalPriceText = 'Договорная';
            } else if (finalPriceType === 'custom') {
                if (!priceText || priceText.trim().length === 0) {
                    return next(ApiError.badRequest('Для кастомной цены необходимо указать текст'));
                }
                finalPriceText = priceText.trim();
            }

            // Проверяем тип файла
            if (!img.mimetype.startsWith('image/')) {
                return next(ApiError.badRequest('Можно загружать только изображения (JPG, PNG, GIF)'));
            }

            // Проверяем размер файла (макс 5MB)
            if (img.size > 5 * 1024 * 1024) {
                return next(ApiError.badRequest('Размер изображения не должен превышать 5MB'));
            }

            let fileName = uuidv4() + ".jpg";
            await img.mv(path.resolve(__dirname, '..', 'static', fileName)); 

            // Создаем товар
            const product = await Product.create({
                name: name.trim(),
                price: finalPrice,
                price_type: finalPriceType,
                price_text: finalPriceText,
                currency: finalCurrency,
                seller_id: seller.id,
                type_id: finalTypeId,    
                img: fileName,
                city: city.trim(),
                description: info?.description || ''
            });

            // Добавляем характеристики если есть
            if (info) {
                try {
                    if (typeof info === 'string') {
                        info = JSON.parse(info);
                    }
                    
                    if (Array.isArray(info) && info.length > 0) {
                        const validInfo = info.filter(item => 
                            item.title && item.description && 
                            item.title.trim() && item.description.trim()
                        );
                        
                        if (validInfo.length > 0) {
                            await Promise.all(validInfo.map(i => 
                                ProductInfo.create({
                                    title: i.title.trim(),
                                    description: i.description.trim(),
                                    product_id: product.id
                                })
                            ));
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing product info:', parseError);
                    // Не прерываем выполнение из-за ошибки в характеристиках
                }
            }

            console.log('Product created successfully:', product.id);
            
            // Получаем полный продукт с информацией
            const fullProduct = await Product.findOne({
                where: { id: product.id },
                include: [
                    { model: ProductInfo, as: 'info' },
                    { model: Type, attributes: ['id', 'name'] }
                ]
            });

            return res.json(fullProduct); 

        } catch (e) {
            console.error('Ошибка при создании продукта:', e); 
            
            // Более точные сообщения об ошибках
            if (e.code === '23503') { // Ошибка внешнего ключа
                if (e.detail && e.detail.includes('sellers')) {
                    return next(ApiError.badRequest('Ошибка: Пользователь не зарегистрирован как продавец. Сначала создайте профиль продавца в личном кабинете.'));
                }
                if (e.detail && e.detail.includes('types')) {
                    return next(ApiError.badRequest('Ошибка: Указан неверный тип товара.'));
                }
                return next(ApiError.badRequest('Ошибка связи данных. Проверьте корректность переданных ID.'));
            }
            
            if (e.code === '23502') { // Ошибка NOT NULL
                const missingField = e.detail?.includes('name') ? 'название' :
                                   e.detail?.includes('city') ? 'город' : 'неизвестное поле';
                return next(ApiError.badRequest(`Не заполнено обязательное поле: ${missingField}`));
            }
            
            if (e.name === 'SequelizeValidationError') {
                return next(ApiError.badRequest('Ошибка валидации данных. Проверьте формат введенных значений.'));
            }
            
            if (e.name === 'SequelizeUniqueConstraintError') {
                return next(ApiError.badRequest('Товар с таким названием уже существует.'));
            }
            
            next(ApiError.badRequest(e.message || 'Неизвестная ошибка при создании товара')); 
        }
    }

    async getAll(req, res) {
        try {
            let { 
                sellerId, 
                typeId, 
                city, 
                limit, 
                page, 
                minPrice, 
                maxPrice, 
                sort,
                excludeNoPrice,
                characteristic 
            } = req.query;
            
            page = page || 1;
            limit = limit || 9;
            let offset = page * limit - limit; 

            let whereClause = {};

            // Базовые фильтры
            if (sellerId) {
                whereClause.seller_id = sellerId;
            }

            if (typeId) {
                whereClause.type_id = typeId;
            }

            if (city) {
                whereClause.city = city;
            }

            // Фильтрация по цене с учетом товаров без цены
            if (minPrice || maxPrice || excludeNoPrice) {
                const priceConditions = [];
                
                // Если указана минимальная цена
                if (minPrice) {
                    const minPriceValue = parseFloat(minPrice);
                    // Включаем товары с ценой >= minPrice И товары без цены (если не исключаем)
                    if (excludeNoPrice === 'true') {
                        priceConditions.push({
                            price: { [Op.gte]: minPriceValue }
                        });
                    } else {
                        priceConditions.push({
                            [Op.or]: [
                                { price: { [Op.gte]: minPriceValue } },
                                { price: null },
                                { price: 0 }
                            ]
                        });
                    }
                }
                
                // Если указана максимальная цена
                if (maxPrice) {
                    const maxPriceValue = parseFloat(maxPrice);
                    priceConditions.push({
                        [Op.or]: [
                            { price: { [Op.lte]: maxPriceValue } },
                            { price: null },
                            { price: 0 }
                        ]
                    });
                }
                
                // Если нужно исключить товары без цены
                if (excludeNoPrice === 'true' && !minPrice) {
                    priceConditions.push({
                        price: { 
                            [Op.ne]: null,
                            [Op.gt]: 0
                        }
                    });
                }
                
                // Объединяем условия цены
                if (priceConditions.length > 0) {
                    whereClause[Op.and] = whereClause[Op.and] || [];
                    whereClause[Op.and].push(...priceConditions);
                }
            }

            // Сортировка
            let order = [['createdAt', 'DESC']]; // по умолчанию новые сначала
            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        order = [
                            ['price', 'ASC NULLS LAST'],
                            ['createdAt', 'DESC']
                        ];
                        break;
                    case 'price_desc':
                        order = [
                            ['price', 'DESC NULLS LAST'],
                            ['createdAt', 'DESC']
                        ];
                        break;
                    case 'name_asc':
                        order = [['name', 'ASC']];
                        break;
                    case 'name_desc':
                        order = [['name', 'DESC']];
                        break;
                    case 'newest':
                    default:
                        order = [['createdAt', 'DESC']];
                        break;
                }
            }

            // Фильтрация по характеристикам
            let includeCharacteristics = [];
            if (characteristic) {
                const characteristics = Array.isArray(characteristic) ? characteristic : [characteristic];
                includeCharacteristics = [{
                    model: ProductInfo,
                    as: 'info',
                    where: {
                        [Op.or]: characteristics.map(char => {
                            const [title, description] = char.split(':');
                            return {
                                title: title,
                                description: description
                            };
                        })
                    },
                    required: true
                }];
            } else {
                includeCharacteristics = [{
                    model: ProductInfo,
                    as: 'info',
                    required: false
                }];
            }

            const products = await Product.findAndCountAll({ 
                where: whereClause, 
                limit, 
                offset,
                order,
                include: [
                    { model: Type, attributes: ['id', 'name'] },
                    ...includeCharacteristics
                ],
                distinct: true // Важно для корректного подсчета при включении связанных моделей
            }); 

            return res.json({
                rows: products.rows,
                count: products.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.count / limit)
            }); 

        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
            return res.status(500).json({ message: 'Ошибка при получении товаров' });
        }
    }

    async geocode(req, res) {
        try {
            const { lat, lng } = req.query;
            
            // Используем Nominatim (OpenStreetMap) для обратного геокодирования
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`);
            const data = await response.json();
            
            let city = 'Минск'; // значение по умолчанию
            
            if (data.address) {
                // Пытаемся найти город в различных полях ответа
                city = data.address.city || 
                       data.address.town || 
                       data.address.village || 
                       data.address.municipality || 
                       'Минск';
            }
            
            // Приводим к одному из городов Беларуси
            const belarusCities = BELARUS_CITIES;
            const normalizedCity = belarusCities.find(belCity => 
                city.toLowerCase().includes(belCity.toLowerCase()) ||
                belCity.toLowerCase().includes(city.toLowerCase())
            ) || 'Минск';
            
            return res.json({ city: normalizedCity });
        } catch (error) {
            console.error('Ошибка геокодирования:', error);
            return res.json({ city: 'Минск' });
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params; 
            const product = await Product.findOne({
                where: { id },
                include: [
                    { model: ProductInfo, as: 'info' },
                    { model: Type, attributes: ['id', 'name'] }
                ] 
            });

            if (!product) {
                return res.status(404).json({ message: 'Продукт не найден' });
            }

            return res.json(product); 
        } catch (error) {
            console.error('Ошибка при получении продукта:', error);
            return res.status(500).json({ message: 'Ошибка сервера при получении продукта' });
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deletedProduct = await Product.destroy({
                where: { id }
            });

            if (!deletedProduct) {
                return next(ApiError.badRequest('Товар не найден'));
            }

            return res.json({ message: 'Товар успешно удален' });
        } catch (e) {
            console.error('Ошибка при удалении товара:', e);
            next(ApiError.internal('Ошибка при удалении товара'));
        }
    }

    async getUniqueCities(req, res) {
        try {
            console.log('Получение уникальных городов...');
            const cities = await Product.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('city')), 'city']],
                raw: true
            });

            const uniqueCities = cities.map(city => city.city).filter(city => city);
            console.log('Уникальные города:', uniqueCities);

            return res.json(uniqueCities);
        } catch (error) {
            console.error('Ошибка при получении городов:', error.message || error);
            return res.status(500).json({ message: 'Ошибка при получении списка городов' });
        }
    }

    async getProductsByCity(req, res) {
        try {
            const { city } = req.params; 
            const products = await Product.findAll({
                where: { city },
                include: [
                    { model: Type, attributes: ['id', 'name'] }
                ]
            });

            if (!products.length) {
                console.log(`Товары не найдены для города: ${city}. Возвращаем все товары.`);
                const allProducts = await Product.findAll({
                    include: [
                        { model: Type, attributes: ['id', 'name'] }
                    ]
                });
                return res.json(allProducts); 
            }

            return res.json(products); 
        } catch (error) {
            console.error('Ошибка при получении товаров по городу:', error);
            return res.status(500).json({ message: 'Ошибка при получении товаров' });
        }
    }

    // Новый метод для получения всех типов товаров
    async getTypes(req, res) {
        try {
            const types = await Type.findAll({
                attributes: ['id', 'name']
            });
            return res.json(types);
        } catch (error) {
            console.error('Ошибка при получении типов:', error);
            return res.status(500).json({ message: 'Ошибка при получении типов товаров' });
        }
    }

    async search(req, res) {
        try {
            let { 
                q: searchQuery, 
                sellerId, 
                typeId, 
                city, 
                limit, 
                page,
                minPrice,
                maxPrice,
                sort,
                excludeNoPrice,
                characteristic
            } = req.query;
            
            page = page || 1;
            limit = limit || 9;
            let offset = page * limit - limit;

            console.log('Поисковый запрос:', searchQuery);

            if (!searchQuery || searchQuery.trim() === '') {
                return res.status(400).json({ message: 'Поисковый запрос не может быть пустым' });
            }

            const searchTerm = searchQuery.trim().toLowerCase();
            
            let whereClause = {
                [Op.or]: [
                    { 
                        name: { 
                            [Op.iLike]: `%${searchTerm}%` 
                        } 
                    },
                    { 
                        description: { 
                            [Op.iLike]: `%${searchTerm}%` 
                        } 
                    },
                    { 
                        price_text: { 
                            [Op.iLike]: `%${searchTerm}%` 
                        } 
                    }
                ]
            };

            // Добавляем фильтры
            if (sellerId) {
                whereClause.seller_id = sellerId;
            }
            if (typeId) {
                whereClause.type_id = typeId;
            }
            if (city) {
                whereClause.city = city;
            }

            // Фильтрация по цене с учетом товаров без цены
            if (minPrice || maxPrice || excludeNoPrice) {
                const priceConditions = [];
                
                // Если указана минимальная цена
                if (minPrice) {
                    const minPriceValue = parseFloat(minPrice);
                    // Включаем товары с ценой >= minPrice И товары без цены (если не исключаем)
                    if (excludeNoPrice === 'true') {
                        priceConditions.push({
                            price: { [Op.gte]: minPriceValue }
                        });
                    } else {
                        priceConditions.push({
                            [Op.or]: [
                                { price: { [Op.gte]: minPriceValue } },
                                { price: null },
                                { price: 0 }
                            ]
                        });
                    }
                }
                
                // Если указана максимальная цена
                if (maxPrice) {
                    const maxPriceValue = parseFloat(maxPrice);
                    priceConditions.push({
                        [Op.or]: [
                            { price: { [Op.lte]: maxPriceValue } },
                            { price: null },
                            { price: 0 }
                        ]
                    });
                }
                
                // Если нужно исключить товары без цены
                if (excludeNoPrice === 'true' && !minPrice) {
                    priceConditions.push({
                        price: { 
                            [Op.ne]: null,
                            [Op.gt]: 0
                        }
                    });
                }
                
                // Объединяем условия цены
                if (priceConditions.length > 0) {
                    whereClause[Op.and] = whereClause[Op.and] || [];
                    whereClause[Op.and].push(...priceConditions);
                }
            }

            // Сортировка
            let order = [['createdAt', 'DESC']];
            if (sort) {
                switch (sort) {
                    case 'price_asc':
                        order = [
                            ['price', 'ASC NULLS LAST'],
                            ['createdAt', 'DESC']
                        ];
                        break;
                    case 'price_desc':
                        order = [
                            ['price', 'DESC NULLS LAST'],
                            ['createdAt', 'DESC']
                        ];
                        break;
                    case 'name_asc':
                        order = [['name', 'ASC']];
                        break;
                    case 'name_desc':
                        order = [['name', 'DESC']];
                        break;
                    case 'newest':
                    default:
                        order = [['createdAt', 'DESC']];
                        break;
                }
            }

            // Фильтрация по характеристикам
            let includeCharacteristics = [];
            if (characteristic) {
                const characteristics = Array.isArray(characteristic) ? characteristic : [characteristic];
                includeCharacteristics = [{
                    model: ProductInfo,
                    as: 'info',
                    where: {
                        [Op.or]: characteristics.map(char => {
                            const [title, description] = char.split(':');
                            return {
                                title: title,
                                description: description
                            };
                        })
                    },
                    required: true
                }];
            } else {
                includeCharacteristics = [{
                    model: ProductInfo,
                    as: 'info',
                    required: false
                }];
            }

            console.log('Условия поиска:', whereClause);

            const products = await Product.findAndCountAll({ 
                where: whereClause, 
                limit, 
                offset,
                order,
                include: [
                    { model: Type, attributes: ['id', 'name'] },
                    ...includeCharacteristics
                ],
                distinct: true
            });

            console.log('Найдено товаров:', products.count);

            return res.json({
                rows: products.rows,
                count: products.count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(products.count / limit),
                searchQuery: searchTerm
            });

        } catch (error) {
            console.error('Ошибка при поиске товаров:', error);
            return res.status(500).json({ message: 'Ошибка при выполнении поиска' });
        }
    }

    // Новый метод для получения списка городов Беларуси
    async getBelarusCities(req, res) {
        try {
            // Получаем уникальные города из базы
            const dbCities = await Product.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('city')), 'city']],
                raw: true
            });

            const uniqueDbCities = dbCities.map(city => city.city).filter(city => city);
            
            // Объединяем с городами Беларуси и убираем дубликаты
            const allCities = [...new Set([...uniqueDbCities, ...BELARUS_CITIES])].sort();
            
            return res.json(allCities);
        } catch (error) {
            console.error('Ошибка при получении городов:', error);
            // В случае ошибки возвращаем статичный список
            return res.json(BELARUS_CITIES.sort());
        }
    }
}

module.exports = new ProductController();