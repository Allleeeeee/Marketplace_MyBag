import React, { useEffect, useState, useContext } from 'react';
import { getUserInfo, getSellerInfo, updateUser, updateSeller } from '../http/userAPI';
import { Context } from '../index';
import { observer } from "mobx-react-lite";
import '../UserInfo.css';

const UserInfo = () => {
    const { user } = useContext(Context);
    const [seller, setSeller] = useState(null);
    const [editingUser, setEditingUser] = useState(false);
    const [editingSeller, setEditingSeller] = useState(false);
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
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchData();
    }, [userId]);

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
                    </div>
                )}
            </div>
        </div>
    );
};

export default observer(UserInfo);