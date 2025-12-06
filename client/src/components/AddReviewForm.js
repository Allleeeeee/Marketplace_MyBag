// components/AddReviewForm.js
import React, { useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import RatingStars from './RatingStars';
import '../css/components/AddReviewForm.css';

const AddReviewForm = ({ sellerId, onSubmit, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('warning'); // 'warning', 'success', 'error'

    const showNotification = (message, type = 'warning') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            showNotification('Пожалуйста, поставьте оценку', 'warning');
            return;
        }

        if (comment.trim().length > 500) {
            showNotification('Комментарий не должен превышать 500 символов', 'warning');
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
            
            showNotification('Отзыв успешно отправлен!', 'success');
            
            // Автоматическое закрытие формы через 2 секунды
            setTimeout(() => {
                if (onCancel) onCancel();
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка при отправке отзыва:', error);
            showNotification(
                error.response?.data?.message || 'Не удалось отправить отзыв', 
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка размера файла (максимум 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Размер изображения не должен превышать 5MB', 'warning');
                e.target.value = '';
                return;
            }
            
            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                showNotification('Пожалуйста, выберите изображение', 'warning');
                e.target.value = '';
                return;
            }
            
            setImage(file);
        }
    };

    const getToastVariant = () => {
        switch (toastType) {
            case 'success': return 'success';
            case 'error': return 'danger';
            default: return 'warning';
        }
    };

    const getToastIcon = () => {
        switch (toastType) {
            case 'success': return '✅';
            case 'error': return '❌';
            default: return '⚠️';
        }
    };

    return (
        <>
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
                        <div className="rating-hint">
                            {rating === 0 && 'Нажмите на звезду для оценки'}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comment">Комментарий (необязательно):</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Поделитесь вашим опытом..."
                            rows="4"
                            maxLength="500"
                        />
                        <div className="char-counter">
                            {comment.length}/500 символов
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Изображение (необязательно):</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <div className="file-hint">
                            Максимальный размер: 5MB. Разрешены: JPG, PNG, GIF
                        </div>
                        {image && (
                            <div className="image-preview">
                                <img src={URL.createObjectURL(image)} alt="Предпросмотр" />
                                <button 
                                    type="button" 
                                    onClick={() => setImage(null)}
                                    className="remove-image-btn"
                                    title="Удалить изображение"
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
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || rating === 0}
                            className="submit-btn"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner"></span>
                                    Отправка...
                                </>
                            ) : (
                                'Отправить отзыв'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Toast уведомления */}
            <ToastContainer position="top-end" className="p-3">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    delay={5000}
                    autohide
                    bg={getToastVariant()}
                >
                    <Toast.Header>
                        <strong className="me-auto">
                            {getToastIcon()} Уведомление
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
};

export default AddReviewForm;