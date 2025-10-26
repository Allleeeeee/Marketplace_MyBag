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

    return (
        <div className="product-card" onClick={() => history.push(PRODUCT_ROUTE + '/' + product.id)}>
            {product.img && (
                <img 
                    src={process.env.REACT_APP_API_URL + product.img} 
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
            )}
            <div className="product-card-body">
                <div className="product-name">{product.name || 'Без названия'}</div>
                <div className="product-price">{product.price || '0'} $</div>
                <div className="product-city">{product.city || 'Город не указан'}</div>
            </div>
        </div>
    );
};

export default observer(ProductItem);