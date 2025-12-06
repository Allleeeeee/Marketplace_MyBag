const { User } = require('./models/models');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
        
        if (!adminExists) {
            const hashPassword = await bcrypt.hash('admin123', 5);
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashPassword,
                role: 'ADMIN'
            });

            console.log('✅ ADMIN пользователь создан');
            console.log('📧 Email: admin@example.com');
            console.log('🔑 Password: admin123');
        } else {
            console.log('ℹ️ ADMIN пользователь уже существует');
        }
    } catch (error) {
        console.error('❌ Ошибка при создании ADMIN пользователя:', error);
    }
};

module.exports = createAdminUser;