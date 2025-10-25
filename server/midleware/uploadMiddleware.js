const multer = require('multer');
const path = require('path');
const ApiError = require('../error/ApiError');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../static'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(ApiError.badRequest('Разрешены только изображения'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;