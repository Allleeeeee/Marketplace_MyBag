// components/AddReviewForm.js
import React, { useState } from 'react';
import RatingStars from './RatingStars';
import '../css/components/AddReviewForm.css';

const AddReviewForm = ({ sellerId, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            alert('Пожалуйста, поставьте оценку');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                sellerId,
                rating,
                comment: comment.trim(),
                image
            });
            
            // Сброс формы после успешной отправки
            setRating(0);
            setComment('');
            setImage(null);
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    return (
        <div className="add-review-form">
            <h3>Добавить отзыв</h3>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Ваша оценка:</label>
                    <RatingStars 
                        rating={rating} 
                        onRatingChange={setRating}
                        size="large"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="comment">Комментарий (необязательно):</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Поделитесь вашим опытом..."
                        rows="4"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Изображение (необязательно):</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {image && (
                        <div className="image-preview">
                            <img src={URL.createObjectURL(image)} alt="Предпросмотр" />
                            <button 
                                type="button" 
                                onClick={() => setImage(null)}
                                className="remove-image-btn"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="cancel-btn"
                    >
                        Отмена
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || rating === 0}
                        className="submit-btn"
                    >
                        {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddReviewForm;