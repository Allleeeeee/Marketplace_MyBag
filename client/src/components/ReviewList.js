// components/ReviewList.js
import React from 'react';
import RatingStars from './RatingStars';
import '../css/components/ReviewList.css';

const ReviewList = ({ reviews, currentUserId, onDeleteReview }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="no-reviews">
                Пока нет отзывов. Будьте первым!
            </div>
        );
    }

    return (
        <div className="review-list">
            {reviews.map((review) => (
                <div key={review.id} className="review-item">
                    <div className="review-header">
                        <div className="review-rating">
                            <RatingStars 
                                rating={review.rating} 
                                readonly 
                                size="small"
                            />
                        </div>
                        <div className="review-date">
                            {formatDate(review.createdAt)}
                        </div>
                    </div>
                    
                    {review.comment && (
                        <div className="review-comment">
                            {review.comment}
                        </div>
                    )}
                    
                    {review.image_url && (
                        <div className="review-image">
                            <img 
                                src={review.image_url} 
                                alt="Отзыв" 
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                    
                    {currentUserId === review.user_id && (
                        <button 
                            className="delete-review-btn"
                            onClick={() => onDeleteReview(review.id)}
                        >
                            Удалить
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;