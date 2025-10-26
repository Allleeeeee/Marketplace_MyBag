// pages/FavoritesPage.js
import React, { useState, useEffect, useContext } from 'react';
import { getUserFavorites, removeFromFavorite } from '../http/favoriteAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { useHistory } from 'react-router-dom';
import '../css/pages/FavoritesPage.css';

const FavoritesPage = observer(() => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(Context);
    const history = useHistory();

    useEffect(() => {
        const fetchFavorites = async () => {
            if (!user.isAuth) {
                setLoading(false);
                return;
            }

            try {
                const favoritesData = await getUserFavorites(user.user.id);
                setFavorites(favoritesData || []);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setFavorites([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user.isAuth, user.user.id]);

    const handleRemoveFavorite = async (favoriteId) => {
        try {
            await removeFromFavorite(favoriteId);
            setFavorites(favorites.filter(fav => fav.id !== favoriteId));
        } catch (error) {
            console.error('Error removing favorite:', error);
            alert('Ошибка при удалении из избранного');
        }
    };

    const handleProductClick = (productId) => {
        history.push(`/product/${productId}`);
    };

    if (!user.isAuth) {
        return (
            <div className="favorites-container">
                <div className="auth-required">
                    <h2>Для просмотра избранного необходимо авторизоваться</h2>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="favorites-container">
                <div className="loading-state">
                    <div className="loading-spinner">Загрузка избранного...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
           
            {favorites.length === 0 ? (
                <div className="empty-favorites">
                    <div className="empty-icon">♥</div>
                    <h2>В избранном пока ничего нет</h2>
                    <p>Добавляйте товары, нажимая на сердечко</p>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map(favorite => (
                        <div key={favorite.id} className="favorite-item">
                            <div 
                                className="favorite-product-card"
                                onClick={() => handleProductClick(favorite.product?.id)}
                            >
                                {favorite.product?.img && (
                                    <img 
                                        src={process.env.REACT_APP_API_URL + favorite.product.img}
                                        alt={favorite.product?.name || 'Товар'}
                                        className="favorite-product-image"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                )}
                                <div className="favorite-product-info">
                                    <h3 className="favorite-product-name">
                                        {favorite.product?.name || 'Неизвестный товар'}
                                    </h3>
                                    <div className="favorite-product-price">
                                        {favorite.product?.price || '0'} $
                                    </div>
                                    <div className="favorite-product-city">
                                        {favorite.product?.city || 'Город не указан'}
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="remove-favorite-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFavorite(favorite.id);
                                }}
                                title="Удалить из избранного"
                            >
                                ♥
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

export default FavoritesPage;