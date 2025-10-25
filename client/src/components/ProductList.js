// components/ProductList.js
import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import ProductItem from './ProductItem';
import '../css/components/ProductList.css'; // Убедитесь, что путь правильный

const ProductList = observer(() => {
    const { product } = useContext(Context);

    if (!product || !product.products || !Array.isArray(product.products)) {
        return (
            <div className="loading-container">
                <div className="loading-text">Продукты загружаются...</div>
            </div>
        );
    }

    if (product.products.length === 0) {
        return (
            <div className="empty-container">
                <div className="empty-text">Нет доступных продуктов</div>
            </div>
        );
    }

    return (
        <div className="product-list-container"> {/* Добавлен контейнер */}
            <div className="product-grid">
                {product.products.map(productItem => (
                    <ProductItem key={productItem.id} product={productItem} />
                ))}
            </div>
        </div>
    );
});

export default ProductList;