import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import ProductItem from './ProductItem';
import SearchBar from './SearchBar';
import FiltersSidebar from './FiltersSidebar';
import '../css/components/ProductList.css';

const ProductList = observer(() => {
    const { product } = useContext(Context);
    const [allProducts, setAllProducts] = useState([]);
    const [showAllProducts, setShowAllProducts] = useState(false);
    const [showFilters, setShowFilters] = useState(true); 

    const loadAllProducts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/prod?limit=1000');
            if (response.ok) {
                const data = await response.json();
                setAllProducts(data.rows || data);
            }
        } catch (error) {
            console.error('Ошибка при загрузке всех товаров:', error);
        }
    };


    const handleShowAllProducts = async () => {
        setShowAllProducts(true);
        await loadAllProducts();
    };

 
    const handleBackToSearch = () => {
        setShowAllProducts(false);
        setAllProducts([]);
    };

    useEffect(() => {
        if (!product.products.length && !product.isLoading && !product.hasActiveSearch) {
            product.fetchProducts();
        }
    }, [product]);

    if (product.isLoading) {
        return (
            <div className="product-page-container">
                <SearchBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">
                        {product.hasActiveSearch 
                            ? `Ищем "${product.currentSearchQuery}"...` 
                            : product.selectedCity 
                                ? `Загружаем товары для города ${product.selectedCity}...`
                                : 'Загружаем товары...'
                        }
                    </div>
                </div>
            </div>
        );
    }
    if (product.error) {
        return (
            <div className="product-page-container">
                <SearchBar />
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <div className="error-text">{product.error}</div>
                    <button 
                        className="retry-button"
                        onClick={() => product.fetchProducts()}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }
    if (showAllProducts) {
        return (
            <div className="product-page-container">
                <SearchBar />
                <div className="products-layout">
                    <div className="products-content">
                       

                        <div className="all-products-notice">
                            <div className="notice-content">
                                <div className="notice-icon">📦</div>
                                <div className="notice-text">
                                    Показаны все доступные товары
                                </div>
                                <button 
                                    onClick={handleBackToSearch}
                                    className="back-to-search-button"
                                >
                                    Вернуться к поиску
                                </button>
                            </div>
                        </div>

                        {allProducts.length > 0 ? (
                            <div className="product-grid">
                                {allProducts.map(productItem => (
                                    <ProductItem key={productItem.id} product={productItem} />
                                ))}
                            </div>
                        ) : (
                            <div className="empty-container">
                                <div className="search-empty-content">
                                    <div className="search-empty-icon">📦</div>
                                    <div className="search-empty-title">
                                        Товары не найдены
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-page-container">
            <SearchBar />
            
            <div className="products-layout">
                {showFilters && <FiltersSidebar />}
                
                <div className="products-content">
                    <div className="product-list-header">
                        <div className="header-content">
                            <h2 className="product-list-title">
                                {product.hasActiveSearch 
                                    ? `Результаты поиска: "${product.currentSearchQuery}"`
                                    : product.selectedCity 
                                        ? `Товары в городе ${product.selectedCity}`
                                        : 'Все товары'
                                }
                            </h2>
                            {product.products.length > 0 && (
                                <div className="product-count-badge">
                                    {product.totalCount}
                                </div>
                            )}
                        </div>
                    </div>

                    {product.products.length === 0 ? (
                        <div className="empty-container">
                            {product.hasActiveSearch ? (
                                <div className="search-empty-content">
                                    <div className="search-empty-icon">🔍</div>
                                    <div className="search-empty-title">
                                        По запросу "{product.currentSearchQuery}" ничего не найдено
                                    </div>
                                    <div className="search-empty-subtitle">
                                        Но вы можете посмотреть все доступные товары
                                    </div>
                                    <button 
                                        onClick={handleShowAllProducts}
                                        className="show-all-button"
                                    >
                                        Показать все товары
                                    </button>
                                </div>
                            ) : (
                                <div className="empty-city-container">
                                    <div className="empty-city-content">
                                        <div className="empty-city-icon">🏙️</div>
                                        <div className="empty-city-title">
                                            В городе <strong>{product.selectedCity}</strong> ничего не найдено
                                        </div>
                                        <div className="empty-city-subtitle">
                                            Попробуйте посмотреть все доступные товары
                                        </div>
                                        <button 
                                            onClick={handleShowAllProducts}
                                            className="show-all-button"
                                        >
                                            Показать все товары
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {product.products.map(productItem => (
                                    <ProductItem key={productItem.id} product={productItem} />
                                ))}
                            </div>

                            {product.totalCount > product.limit && (
                                <div className="pagination-container">
                                    <div className="pagination-info">
                                        Страница {product.page} из {Math.ceil(product.totalCount / product.limit)}
                                    </div>
                                    <div className="pagination-controls">
                                        <button 
                                            className="pagination-button"
                                            disabled={product.page <= 1}
                                            onClick={async () => {
                                                product.setPage(product.page - 1);
                                                await product.fetchProducts();
                                            }}
                                        >
                                            Назад
                                        </button>
                                        <button 
                                            className="pagination-button"
                                            disabled={product.page >= Math.ceil(product.totalCount / product.limit)}
                                            onClick={async () => {
                                                product.setPage(product.page + 1);
                                                await product.fetchProducts();
                                            }}
                                        >
                                            Вперед
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ProductList;