// pages/ProductPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchOneProduct } from '../http/productAPI';
import { addToFavorite, removeFromFavorite, getUserFavorites } from '../http/favoriteAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import '../css/pages/ProductPage.css';

const ProductPage = observer(() => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const { id } = useParams();
    const history = useHistory();
    const { user } = useContext(Context);

    useEffect(() => {
        const getProduct = async () => {
            try {
                setLoading(true);
                const productData = await fetchOneProduct(id);
                setProduct(productData);

                if (user.isAuth && productData) {
                    try {
                        const favorites = await getUserFavorites(user.user.id);
                        const favoriteItem = favorites.find(fav => fav.product_id === productData.id);
                        if (favoriteItem) {
                            setIsFavorite(true);
                            setFavoriteId(favoriteItem.id);
                        }
                    } catch (favoriteError) {
                        console.error('Error checking favorites:', favoriteError);
                    }
                }
            } catch (e) {
                setError('Ошибка при загрузке товара');
                console.error('Error fetching product:', e);
            } finally {
                setLoading(false);
            }
        };

        getProduct();
    }, [id, user.isAuth, user.user.id]);

    const handleFavoriteToggle = async () => {
        if (!user.isAuth) {
            alert('Для добавления в избранное необходимо авторизоваться');
            return;
        }

        if (!product) return;

        try {
            if (isFavorite) {
                await removeFromFavorite(favoriteId);
                setIsFavorite(false);
                setFavoriteId(null);
            } else {
                const favorite = await addToFavorite(user.user.id, product.id);
                setIsFavorite(true);
                setFavoriteId(favorite.id);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Ошибка при изменении избранного');
        }
    };

    if (loading) {
        return (
            <div className="product-page-container">
                <div className="loading-state">
                    <div className="loading-spinner">Загрузка товара...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-page-container">
                <div className="error-state">
                    <div className="alert alert-danger">{error}</div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-page-container">
                <div className="not-found-state">
                    <div className="alert alert-warning">Товар не найден</div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-page-container">
            {/* Хедер страницы */}
            <div className="product-page-header">
                <div className="product-nav">
                    <button className="back-button" onClick={() => history.goBack()}>
                        ← Назад к товарам
                    </button>
                    <div className="page-title">Детали товара</div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="product-main-content">
                <div className="product-layout">
                    {/* Левая колонка - изображение */}
                    <div className="product-gallery">
                        <div className="main-image-container">
                            {product.img && (
                                <img 
                                    src={process.env.REACT_APP_API_URL + product.img}
                                    alt={product.name}
                                    className="main-product-image"
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                            )}
                            <div className="gallery-overlay"></div>
                        </div>
                    </div>

                    {/* Правая колонка - информация */}
                    <div className="product-details">
                        {/* Основная информация */}
                        <div className="product-info-card">
                            <div className="product-title-section">
                                <h1 className="product-title">{product.name}</h1>
                                <div className="product-category">Товар</div>
                            </div>

                            <div className="product-price-section">
                                <div className="price-section">
                                    <div className="product-price">
                                        {product.price}
                                        <span className="price-currency"> $</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className={`favorite-button ${isFavorite ? 'favorite-active' : ''}`}
                                        onClick={handleFavoriteToggle}
                                        title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                                    >
                                        {isFavorite ? '♥' : '♡'}
                                    </button>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-label">Город</div>
                                    <div className="info-text">{product.city}</div>
                                </div>
                                
                                {product.description && (
                                    <div className="info-item">
                                        <div className="info-label">Описание</div>
                                        <p className="info-text">{product.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Характеристики */}
                        {product.info && product.info.length > 0 && (
                            <div className="characteristics-section">
                                <h3 className="section-title">Характеристики</h3>
                                <div className="characteristics-grid">
                                    {product.info.map((infoItem, index) => (
                                        <div key={index} className="characteristic-item">
                                            <span className="characteristic-title">{infoItem.title}</span>
                                            <span className="characteristic-value">{infoItem.description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Кнопка связи */}
                        <div className="contact-section">
                            <button className="contact-button glow-effect">
                                Связаться с продавцом
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProductPage;