// pages/UserInfo.js
import React, { useEffect, useState, useContext } from 'react';
import { getUserInfo, getSellerInfo, updateUser, updateSeller } from '../http/userAPI';
import { Context } from '../index';
import { observer } from "mobx-react-lite";
import EditProductModal from '../components/modals/EditProductModal';
import '../UserInfo.css';

const UserInfo = () => {
    const { user } = useContext(Context);
    const [seller, setSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [editingUser, setEditingUser] = useState(false);
    const [editingSeller, setEditingSeller] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updatedUser, setUpdatedUser] = useState({ 
        username: user.user.username, 
        email: user.user.email, 
        phone: user.user.phone 
    });
    const [updatedSeller, setUpdatedSeller] = useState({ 
        name: '', 
        description: '', 
        img: null
    });
    const [imagePreview, setImagePreview] = useState('');
    const userId = user.user.id;

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                const userInfo = await getUserInfo(userId);
                user.setUser(userInfo);
                if (user.user.id) {
                    const sellerData = await getSellerInfo(user.user.id);
                    setSeller(sellerData);
                    setUpdatedSeller({ 
                        name: sellerData.name, 
                        description: sellerData.description, 
                        img: null 
                    });
                    setImagePreview(sellerData.img);
                    
                    // Загружаем товары продавца
                    if (sellerData.id) {
                        await loadSellerProducts(sellerData.id);
                    }
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchData();
    }, [userId]);

    const loadSellerProducts = async (sellerId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/seller/${sellerId}/products`);
            if (response.ok) {
                const products = await response.json();
                setSellerProducts(products);
            }
        } catch (error) {
            console.error('Ошибка при загрузке товаров:', error);
        }
    };

    const handleUserUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUser(userId, updatedUser);
            user.setUser({ ...user.user, ...updatedUser });
            setEditingUser(false);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
        }
    };

    const handleSellerUpdate = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', updatedSeller.name);
            formData.append('description', updatedSeller.description);
            
            if (updatedSeller.img) {
                formData.append('img', updatedSeller.img);
            }

            const updatedSellerData = await updateSeller(seller.id, formData);
            
            setSeller(updatedSellerData);
            setEditingSeller(false);
            setUpdatedSeller({ ...updatedSeller, img: null });
            
        } catch (error) {
            console.error('Ошибка при обновлении продавца:', error);
        }
    };

   // pages/UserInfo.js - обновите handleProductUpdate
// pages/UserInfo.js - обновите handleProductUpdate
const handleProductUpdate = async (productId, productData) => {
    setUpdateLoading(true);
    try {
        const response = await fetch(`http://localhost:5000/api/prod/${productId}`, {
            method: 'PUT',
            body: productData,
        });

        console.log('Update response status:', response.status);

        if (response.ok) {
            await loadSellerProducts(seller.id);
            setShowEditModal(false);
            setEditingProduct(null);
            // Показываем сообщение об успехе
            alert('Товар успешно обновлен!');
        } else {
            const errorData = await response.json();
            console.error('Update error:', errorData);
            throw new Error(errorData.message || `Ошибка сервера: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при обновлении товара:', error);
        alert(`Не удалось обновить товар: ${error.message}`);
    } finally {
        setUpdateLoading(false);
    }
};

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/prod/${productId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await loadSellerProducts(seller.id);
                } else {
                    throw new Error('Ошибка при удалении товара');
                }
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                alert('Не удалось удалить товар');
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUpdatedSeller({ ...updatedSeller, img: file });
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const cancelEditSeller = () => {
        setEditingSeller(false);
        setUpdatedSeller({ 
            name: seller.name, 
            description: seller.description, 
            img: null 
        });
        setImagePreview(seller.img);
    };

    const startEditProduct = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
    };

    return (
        <div className="user-info-container">
            <h1>Личный кабинет</h1>
            <div className="user-info">
                <div className="user-details">
                    {!editingUser ? (
                        <div className="info-display">
                            <p><strong>Имя:</strong> {user.user.username}</p>
                            <p><strong>Email:</strong> {user.user.email}</p>
                            <p><strong>Телефон:</strong> {user.user.phone}</p>
                            <button className="edit-button" onClick={() => setEditingUser(true)}>
                                Редактировать
                            </button>
                        </div>
                    ) : (
                        <form className="info-edit" onSubmit={handleUserUpdate}>
                            <input
                                type="text"
                                value={updatedUser.username}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                                placeholder="Имя"
                            />
                            <input
                                type="email"
                                value={updatedUser.email}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                                placeholder="Email"
                            />
                            <input
                                type="tel"
                                value={updatedUser.phone}
                                onChange={(e) => setUpdatedUser({ ...updatedUser, phone: e.target.value })}
                                placeholder="Телефон"
                            />
                            <button type="submit" className="save-button">Сохранить</button>
                            <button type="button" onClick={() => setEditingUser(false)} className="cancel-button">
                                Отмена
                            </button>
                        </form>
                    )}
                </div>
                
                {seller && (
                    <div className="seller-info">
                        <h2>Профиль продавца</h2>
                        <div className="seller-profile">
                            <div className="seller-image-section">
                                <div className="image-wrapper">
                                    <img 
                                        src={imagePreview || seller.img} 
                                        alt={seller.name} 
                                        className="seller-avatar" 
                                    />
                                </div>
                                {!editingSeller && (
                                    <button className="edit-profile-button" onClick={() => setEditingSeller(true)}>
                                        Редактировать профиль
                                    </button>
                                )}
                            </div>
                            
                            {!editingSeller ? (
                                <div className="seller-details">
                                    <p><strong>Название магазина:</strong> {seller.name}</p>
                                    <p><strong>Описание:</strong> {seller.description}</p>
                                    <p><strong>Рейтинг:</strong> {seller.rating ? seller.rating.toFixed(1) : 'Нет оценок'}</p>
                                </div>
                            ) : (
                                <form className="seller-edit-form" onSubmit={handleSellerUpdate}>
                                    <div className="form-group">
                                        <label>Название магазина:</label>
                                        <input
                                            type="text"
                                            value={updatedSeller.name}
                                            onChange={(e) => setUpdatedSeller({ ...updatedSeller, name: e.target.value })}
                                            placeholder="Введите название магазина"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Описание:</label>
                                        <textarea
                                            value={updatedSeller.description}
                                            onChange={(e) => setUpdatedSeller({ ...updatedSeller, description: e.target.value })}
                                            placeholder="Расскажите о вашем магазине"
                                            rows="4"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Изображение профиля:</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="file-input"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="save-button">Сохранить изменения</button>
                                        <button type="button" onClick={cancelEditSeller} className="cancel-button">
                                            Отмена
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Секция товаров продавца */}
                        <div className="seller-products-section">
                            <h3>Мои товары ({sellerProducts.length})</h3>
                            
                            {sellerProducts.length === 0 ? (
                                <div className="no-products">
                                    У вас пока нет товаров
                                </div>
                            ) : (
                                <div className="products-grid">
                                    {sellerProducts.map(product => (
                                        <div key={product.id} className="product-card">
                                            <div className="product-image">
                                                <img 
                                                    src={product.img} 
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="product-image-placeholder">
                                                    Товар
                                                </div>
                                            </div>
                                            <div className="product-info">
                                                <h4 className="product-name">{product.name}</h4>
                                                <p className="product-city">{product.city}</p>
                                                <div className="product-price">
                                                    {product.price_type === 'fixed' && product.price ? (
                                                        `${product.price} ${product.currency || 'BYN'}`
                                                    ) : product.price_type === 'negotiable' ? (
                                                        'Договорная'
                                                    ) : (
                                                        product.price_text || 'Цена не указана'
                                                    )}
                                                </div>
                                                <div className="product-actions">
                                                    <button 
                                                        className="edit-product-btn"
                                                        onClick={() => startEditProduct(product)}
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button 
                                                        className="delete-product-btn"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Модальное окно редактирования товара */}
            <EditProductModal
                show={showEditModal}
                onHide={handleCloseEditModal}
                product={editingProduct}
                onUpdate={handleProductUpdate}
                loading={updateLoading}
            />
        </div>
    );
};

export default observer(UserInfo);