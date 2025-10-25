// components/SearchBar.js
import React, { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import '../css/components/SearchBar.css';

const SearchBar = observer(() => {
    const { product } = useContext(Context);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Поиск товаров
    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            // Если поисковый запрос пустой, сбрасываем поиск
            await product.clearSearch();
            return;
        }

        setIsSearching(true);
        
        try {
            await product.searchProducts(searchQuery.trim());
        } catch (error) {
            console.error('Ошибка при выполнении поиска:', error);
        } finally {
            setIsSearching(false);
        }
    };

    // Очистка поиска
    const clearSearch = async () => {
        setSearchQuery('');
        await product.clearSearch();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <div className="search-bar-container">
            <div className="search-header">
                <h2 className="search-title">
                    {product.selectedCity 
                        ? `Поиск товаров в ${product.selectedCity}`
                        : 'Поиск товаров'
                    }
                </h2>
                <div className="search-subtitle">
                    {product.selectedCity 
                        ? `Ищите по названию, описанию или цене`
                        : 'Выберите город для поиска товаров'
                    }
                </div>
            </div>

            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                    <div className="search-icon">🔍</div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            product.selectedCity 
                                ? `Поиск в ${product.selectedCity}...`
                                : 'Сначала выберите город...'
                        }
                        className="search-input"
                        disabled={isSearching || !product.selectedCity}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="clear-search-button"
                            disabled={isSearching}
                        >
                            ✕
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="search-button"
                        disabled={isSearching || !product.selectedCity || !searchQuery.trim()}
                    >
                        {isSearching ? (
                            <div className="search-spinner"></div>
                        ) : (
                            'Найти'
                        )}
                    </button>
                </div>
            </form>

            {/* Информация о текущем поиске */}
            {product.hasActiveSearch && (
                <div className="search-results-info">
                    <div className="results-main">
                        <div className="results-count">
                            Найдено: <strong>{product.totalCount}</strong> товаров
                        </div>
                        <div className="search-context">
                            в <strong>{product.selectedCity}</strong>
                        </div>
                    </div>
                    <div className="search-query">
                        По запросу: "<strong>{product.currentSearchQuery}</strong>"
                    </div>
                    <button 
                        onClick={clearSearch}
                        className="clear-search-link"
                    >
                        Сбросить поиск
                    </button>
                </div>
            )}

            {/* Сообщение если город не выбран */}
            {!product.selectedCity && (
                <div className="no-city-message">
                    <div className="no-city-icon">📍</div>
                    <div className="no-city-text">
                        <strong>Выберите город выше</strong> для поиска товаров
                    </div>
                </div>
            )}
        </div>
    );
});

export default SearchBar;