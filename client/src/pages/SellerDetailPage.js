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
            }
        } catch (error) {
            console.error('Ошибка при загрузке отзывов:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleAddReview = async (reviewData) => {
        try {
            const formData = new FormData();
            formData.append('sellerId', reviewData.sellerId);
            formData.append('userId', user.user.id);
            formData.append('rating', reviewData.rating);
            formData.append('comment', reviewData.comment);
            if (reviewData.image) {
                formData.append('image', reviewData.image);
            }

            const response = await fetch('http://localhost:5000/api/review', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                await loadReviews(); // Перезагружаем отзывы
                await product.fetchSellerById(id); // Обновляем рейтинг продавца
                setShowReviewForm(false);
            } else {
                throw new Error('Ошибка при добавлении отзыва');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось добавить отзыв');
            throw error;
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Вы уверены, что хотите удалить отзыв?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/review/${reviewId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    await loadReviews(); // Перезагружаем отзывы
                    await product.fetchSellerById(id); // Обновляем рейтинг продавца
                } else {
                    throw new Error('Ошибка при удалении отзыва');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось удалить отзыв');
            }
        }
    };

    const handleProductClick = (productId) => {
        history.push(`/product/${productId}`);
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
                <div className="seller-header">
                    <div className="seller-avatar">
                        {product.selectedSeller.img ? (
                            <img 
                                src={product.selectedSeller.img} 
                                alt={product.selectedSeller.name}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        
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
                            >
                                Написать отзыв
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
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        
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