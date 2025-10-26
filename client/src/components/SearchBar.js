import React, { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import '../css/components/SearchBar.css';

const SearchBar = observer(() => {
    const { product } = useContext(Context);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
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

            {!product.selectedCity && (
                <div className="no-city-message">
                    <div className="no-city-text">
                        Выберите город для поиска товаров
                    </div>
                </div>
            )}
        </div>
    );
});

export default SearchBar;