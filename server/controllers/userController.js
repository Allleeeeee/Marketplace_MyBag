const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Seller } = require('../models/models');


const generateJwt=(id, email,role)=> {
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
        
          const user = await User.create({ username, email, role, password: hashPassword });
      

        await Seller.create({
            user_id: user.id,
            name: '',
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
    async login(req, res,next) {
        const {email, password}= req.body
        const user = await User.findOne({where: {email}})
        if(!user){
            return next(ApiError.internal('пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword){
            return next(ApiError.internal('указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({token})
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
        const { id } = req.params; 
        const { username, email, phone } = req.body; 
        try {
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return next(ApiError.notFound('Пользователь не найден'));
            }
            await User.update({ username, email, phone }, { where: { id } });
            return res.json({ message: 'Информация о пользователе обновлена' });
        } catch (e) {
            next(ApiError.internal('Ошибка при обновлении информации о пользователе'));
        }
    }

   async deleteUser(req, res, next) {
    const { id } = req.params; 
    try {
        const user = await User.destroy({ where: { id } });
        if (!user) {
            return next(ApiError.notFound('Пользователь не найден'));
        }
        return res.json({ message: 'Пользователь и все связанные записи удалены' });
    } catch (e) {
        next(ApiError.internal('Ошибка при удалении пользователя'));
    }
}
}

module.exports = new UserController();