// components/ShopSearchButton.js
import React from 'react';
import { useHistory } from 'react-router-dom';
import '../css/components/ShopSearchButton.css';

const ShopSearchButton = () => {
    const history = useHistory();

    const handleShopSearch = () => {
        history.push('/sellers');
    };

    return (
        <button 
            className="shop-search-button"
            onClick={handleShopSearch}
            title="Поиск по магазинам"
        >
            <span className="button-text">Магазины</span>
        </button>
    );
};

export default ShopSearchButton;