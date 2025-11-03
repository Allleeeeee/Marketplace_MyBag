// components/RatingStars.js
import React, { useState } from 'react';
import '../css/components/RatingStars.css';

const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleStarClick = (value) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const handleStarHover = (value) => {
        if (!readonly) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div 
            className={`rating-stars ${size} ${readonly ? 'readonly' : ''}`}
            onMouseLeave={handleMouseLeave}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star ${star <= displayRating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                >
                    ★
                </span>
            ))}
            {readonly && rating > 0 && (
                <span className="rating-value">({rating.toFixed(1)})</span>
            )}
        </div>
    );
};

export default RatingStars;