// middleware/adminMiddleware.js
const ApiError = require('../error/ApiError');

const adminMiddleware = (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return next(ApiError.forbidden('Требуются права администратора'));
        }
        next();
    } catch (e) {
        next(ApiError.unauthorized('Не авторизован'));
    }
};

module.exports = adminMiddleware;