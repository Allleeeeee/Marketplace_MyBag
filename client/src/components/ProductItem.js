// ProductItem.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import { PRODUCT_ROUTE } from '../utils/const';
import { observer } from 'mobx-react-lite';
import '../css/components/ProductItem.css';

const ProductItem = ({ product }) => {
    const history = useHistory();

    if (!product) {
        return null; 
    }

    // Функция для форматирования цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price || 0);
    };

    // Функция для обрезки длинного названия
    const truncateName = (name) => {
        if (!name) return 'Без названия';
        return name.length > 50 ? name.substring(0, 50) + '...' : name;
    };

    return (
        <div 
            className="card-product" 
            onClick={() => history.push(PRODUCT_ROUTE + '/' + product.id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    history.push(PRODUCT_ROUTE + '/' + product.id);
                }
            }}
        >
            {product.img && (
                <img 
                    src={process.env.REACT_APP_API_URL + product.img} 
                    alt={product.name}
                    className="card-image"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                    loading="lazy"
                />
            )}
            <div className="card-body">
                <div className="card-name">{truncateName(product.name)}</div>
                <div className="card-price">{formatPrice(product.price)} BYN</div>
                <div className="card-city">{product.city || 'Город не указан'}</div>
            </div>
        </div>
    );
};

export default observer(ProductItem);