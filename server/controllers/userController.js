const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Seller, Product, Favorite, Review, Message } = require('../models/models');

const generateJwt = (id, email, role) => {
    return jwt.sign({ id, email, role }, process.env.SECRET_KEY, { expiresIn: '24h' });
}

class UserController {
    async registration(req, res, next) {
        try {
            const { username, email, password, role } = req.body;
            if (!email || !password || !username) {
                return next(ApiError.badRequest('Некорректный email, password или username'));
            }

            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }

            const hashPassword = await bcrypt.hash(password, 5);
            
            const user = await User.create({ 
                username, 
                email, 
                role: role, 
                password: hashPassword 
            });

            await Seller.create({
                user_id: user.id,
                name: username,
                description: '',
                img: 'default_image_url.jpg'
            });

            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при регистрации'));
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
            if (user.is_blocked) {
                return next(ApiError.forbidden('Ваш аккаунт заблокирован. Обратитесь к администратору.'));
            }

            let comparePassword = bcrypt.compareSync(password, user.password);
            if (!comparePassword) {
                return next(ApiError.internal('Указан неверный пароль'));
            }
            
            const token = generateJwt(user.id, user.email, user.role);
            return res.json({ token });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при авторизации'));
        }
    }

    async check(req, res, next) {
        try {
            const currentUser = await User.findOne({ where: { id: req.user.id } });
            if (currentUser.is_blocked) {
                return next(ApiError.forbidden('Ваш аккаунт заблокирован. Обратитесь к администратору.'));
            }
            
            const token = generateJwt(req.user.id, req.user.email, req.user.role);
            return res.json({ token });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при проверке авторизации'));
        }
    }

     async getUserInfo(req, res, next) {
        const { id } = req.params; 
        try {
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }
            return res.json(user);
        } catch (e) {
            next(ApiError.internal('Ошибка при получении информации о пользователе'));
        }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params; 
            const { username, email, phone } = req.body; 
            
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }

            
            if (user.is_blocked && req.user.role !== 'ADMIN') {
                return next(ApiError.forbidden('Нельзя обновить данные заблокированного аккаунта'));
            }

            
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return next(ApiError.badRequest('Пользователь с таким email уже существует'));
                }
            }

            await User.update({ username, email, phone }, { where: { id } });
            
            const updatedUser = await User.findOne({
                where: { id },
                attributes: { exclude: ['password'] }
            });
            
            return res.json({ 
                message: 'Информация о пользователе обновлена',
                user: updatedUser
            });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при обновлении информации о пользователе'));
        }
    }
    async getAllUsers(req, res, next) {
      
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Seller,
                        attributes: ['id', 'name', 'description', 'img', 'rating']
                    }
                ]
            });
            return res.json(users);
       
    }

    async blockUser(req, res, next) {
        try {
            const { id } = req.params; 
            const user = await User.findOne({ 
                where: { id },
                include: [{ model: Seller }]
            });
            
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }

            if (parseInt(id) === parseInt(req.user.id)) {
                return next(ApiError.badRequest('Нельзя заблокировать самого себя'));
            }
            if (user.role === 'ADMIN') {
                return next(ApiError.badRequest('Нельзя заблокировать администратора'));
            }

            if (user.is_blocked) {
                return next(ApiError.badRequest('Пользователь уже заблокирован'));
            }

            await User.update({ is_blocked: true }, { where: { id } });
            
                if (user.Seller) {
                await Product.update({ is_hidden: true }, { 
                    where: { 
                        seller_id: user.Seller.id 
                    } 
                });
            }

            return res.json({ 
                message: 'Пользователь успешно заблокирован',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_blocked: true
                }
            });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при блокировке пользователя'));
        }
    }

    async unblockUser(req, res, next) {
        try {
            const { id } = req.params; 
            const user = await User.findOne({ 
                where: { id },
                include: [{ model: Seller }]
            });
            
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }

            if (!user.is_blocked) {
                return next(ApiError.badRequest('Пользователь не заблокирован'));
            }

            await User.update({ is_blocked: false }, { where: { id } });
            
                  if (user.Seller) {
                await Product.update({ is_hidden: false }, { 
                    where: { 
                        seller_id: user.Seller.id 
                    } 
                });
            }

            return res.json({ 
                message: 'Пользователь успешно разблокирован',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_blocked: false
                }
            });
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при разблокировке пользователя'));
        }
    }

    async getUserStats(req, res, next) {
        try {
            const totalUsers = await User.count();
            const activeUsers = await User.count({ where: { is_blocked: false } });
            const blockedUsers = await User.count({ where: { is_blocked: true } });
            const adminUsers = await User.count({ where: { role: 'ADMIN' } });
            const regularUsers = await User.count({ where: { role: 'USER' } });

            const stats = {
                totalUsers,
                activeUsers,
                blockedUsers,
                adminUsers,
                regularUsers,
                blockedPercentage: ((blockedUsers / totalUsers) * 100).toFixed(2)
            };

            return res.json(stats);
        } catch (e) {
            console.error(e);
            next(ApiError.internal('Ошибка при получении статистики пользователей'));
        }
    }

  
}

module.exports = new UserController();