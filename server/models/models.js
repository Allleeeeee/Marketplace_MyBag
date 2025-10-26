const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    phone: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'USER' }
});

const Seller = sequelize.define('seller', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    description: { type: DataTypes.STRING },
    img: { type: DataTypes.STRING },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }
});


const Product = sequelize.define('product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT }, 
    price_type: { type: DataTypes.STRING, defaultValue: 'fixed' }, 
    price_text: { type: DataTypes.STRING }, 
    currency: { type: DataTypes.STRING, defaultValue: 'USD' }, 
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    type_id: { type: DataTypes.INTEGER }, 
    img: { type: DataTypes.STRING }
});


const Message = sequelize.define('message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    receiver_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER },
    message: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Type = sequelize.define('type', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
});

const ProductInfo = sequelize.define('product_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
});


const Favorite = sequelize.define('favorite', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false }
});


const Review = sequelize.define('review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});


const Device = sequelize.define('device', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    rating: { type: DataTypes.INTEGER, defaultValue: 0 },
    img: { type: DataTypes.STRING, allowNull: false }
});

const DeviceInfo = sequelize.define('device_info', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    device_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: false }
});

User.hasOne(Seller, { foreignKey: 'user_id' });
Seller.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(Favorite, { foreignKey: 'user_id' });
Favorite.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Seller.hasMany(Product, { foreignKey: 'seller_id' });
Product.belongsTo(Seller, { foreignKey: 'seller_id' });

Seller.hasMany(Review, { foreignKey: 'seller_id' });
Review.belongsTo(Seller, { foreignKey: 'seller_id' });

Product.hasMany(Message, { foreignKey: 'product_id' });
Message.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductInfo, { foreignKey: 'product_id', as: 'info' });
ProductInfo.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Favorite, { foreignKey: 'product_id' });
Favorite.belongsTo(Product, { foreignKey: 'product_id' });

Product.belongsTo(Type, { foreignKey: 'type_id' });
Type.hasMany(Product, { foreignKey: 'type_id' });

Device.hasMany(DeviceInfo, { foreignKey: 'device_id', as: 'info' });
DeviceInfo.belongsTo(Device, { foreignKey: 'device_id' });

module.exports = { 
    User, 
    Seller, 
    Product, 
    Message, 
    Type, 
    ProductInfo, 
    Favorite, 
    Review, 
    Device, 
    DeviceInfo
};