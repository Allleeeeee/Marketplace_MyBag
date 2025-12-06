// pages/SellerDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { useParams, useHistory } from 'react-router-dom';
import RatingStars from '../components/RatingStars';
import ReviewList from '../components/ReviewList';
import AddReviewForm from '../components/AddReviewForm';
import '../css/pages/SellerDetailPage.css';

const SellerDetailPage = observer(() => {
    const { product, user } = useContext(Context);
    const { id } = useParams();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadSellerData();
        loadReviews();
    }, [id]);

    const loadSellerData = async () => {
        setLoading(true);
        setProductsLoading(true);
        try {
            await product.fetchSellerById(id);
            await product.fetchSellerProducts(id);
        } catch (error) {
            console.error('Ошибка при загрузке данных продавца:', error);
        } finally {
            setLoading(false);
            setProductsLoading(false);
        }
    };

    const loadReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/review/seller/${id}`);
            if (response.ok) {
                const reviewsData = await response.json();
                setReviews(reviewsData);
            } else {
                throw new Error('Ошибка при загрузке отзывов');
            }
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddReview = async (reviewData) => {
        setActionLoading(true);
        try {
            console.log('📝 Отправка отзыва:', reviewData);
            
            const response = await fetch('http://localhost:5000/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    sellerId: parseInt(id),
                    userId: user.user.id,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    imageUrl: null
                }),
            });

            const responseData = await response.json();
            
            if (response.ok) {
                console.log('✅ Отзыв успешно создан:', responseData);
                await loadReviews();
                await product.fetchSellerById(id);
                setShowReviewForm(false);
                alert('Отзыв успешно добавлен!');
            } else {
                console.error('❌ Ошибка от сервера:', responseData);
                throw new Error(responseData.message || 'Ошибка при добавлении отзыва');
            }
        } catch (error) {
            console.error('❌ Ошибка при добавлении отзыва:', error);
            alert(error.message || 'Не удалось добавить отзыв');
            throw error;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Вы уверены, что хотите удалить отзыв?')) {
            setActionLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/api/review/${reviewId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    await loadReviews();
                    await product.fetchSellerById(id);
                    alert('Отзыв успешно удален!');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ошибка при удалении отзыва');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert(error.message || 'Не удалось удалить отзыв');
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleProductClick = (productId) => {
        history.push(`/product/${productId}`);
    };

    // Безопасная функция для обработки ошибок изображений
    const handleImageError = (e) => {
        if (e.target) {
            e.target.style.display = 'none';
        }
    };

    // Безопасная функция для получения первой буквы имени
    const getFirstLetter = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    if (loading) {
        return <div className="loading">Загрузка информации о продавце...</div>;
    }

    if (!product.selectedSeller) {
        return (
            <div className="error">
                Продавец не найден
                <button onClick={() => history.push('/sellers')} className="back-button">
                    Вернуться к списку магазинов
                </button>
            </div>
        );
    }

    const hasUserReviewed = reviews.some(review => review.user_id === user.user?.id);

    return (
        <div className="seller-detail-page">
            <div className="seller-detail-container">
                {/* Заголовок и основная информация */}
                <div className="seller-header">
                    <div className="seller-avatar">
                        {product.selectedSeller.img ? (
                            <img 
                                src={product.selectedSeller.img} 
                                alt={product.selectedSeller.name}
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {getFirstLetter(product.selectedSeller.name)}
                            </div>
                        )}
                    </div>
                    <div className="seller-basic-info">
                        <h1 className="seller-title">{product.selectedSeller.name}</h1>
                        
                        <div className="seller-rating-section">
                            <RatingStars 
                                rating={product.selectedSeller.rating || 0} 
                                readonly 
                                size="large"
                            />
                            <span className="rating-text">
                                {product.selectedSeller.rating 
                                    ? product.selectedSeller.rating.toFixed(1) 
                                    : 'Нет оценок'
                                }
                            </span>
                            <span className="reviews-count">
                                ({reviews.length} отзывов)
                            </span>
                        </div>

                        {product.selectedSeller.description && (
                            <p className="seller-description-full">
                                {product.selectedSeller.description}
                            </p>
                        )}

                        {user.isAuth && !hasUserReviewed && (
                            <button 
                                className="add-review-btn"
                                onClick={() => setShowReviewForm(true)}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'Загрузка...' : 'Написать отзыв'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Форма добавления отзыва */}
                {showReviewForm && (
                    <AddReviewForm
                        sellerId={parseInt(id)}
                        onSubmit={handleAddReview}
                        onCancel={() => setShowReviewForm(false)}
                        loading={actionLoading}
                    />
                )}

                {/* Секция отзывов */}
                <div className="seller-reviews-section">
                    <h2 className="reviews-title">Отзывы о продавце</h2>
                    
                    {reviewsLoading ? (
                        <div className="loading">Загрузка отзывов...</div>
                    ) : (
                        <ReviewList
                            reviews={reviews}
                            currentUserId={user.user?.id}
                            onDeleteReview={handleDeleteReview}
                            loading={actionLoading}
                        />
                    )}
                </div>

                {/* Секция товаров */}
                <div className="seller-products-section">
                    <h2 className="products-title">Товары продавца ({product.sellerProducts.length})</h2>
                    
                    {productsLoading ? (
                        <div className="loading">Загрузка товаров...</div>
                    ) : product.sellerProducts.length > 0 ? (
                        <div className="products-grid">
                            {product.sellerProducts.map(productItem => (
                                <div 
                                    key={productItem.id} 
                                    className="product-card"
                                    onClick={() => handleProductClick(productItem.id)}
                                >
                                    <div className="product-image">
                                        {productItem.img ? (
                                            <img 
                                                src={productItem.img} 
                                                alt={productItem.name}
                                                onError={handleImageError}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                📷
                                            </div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3 className="product-name">{productItem.name}</h3>
                                        <p className="product-city">{productItem.city}</p>
                                        <div className="product-price">
                                            {productItem.price_type === 'fixed' && productItem.price ? (
                                                `${productItem.price} ${productItem.currency || 'BYN'}`
                                            ) : productItem.price_type === 'negotiable' ? (
                                                'Договорная'
                                            ) : (
                                                productItem.price_text || 'Цена не указана'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-products">
                            У этого продавца пока нет товаров
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default SellerDetailPage;