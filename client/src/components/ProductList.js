// components/ProductList.js
import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import ProductItem from './ProductItem';
import '../css/components/ProductList.css';

const ProductList = observer(() => {
    const { product } = useContext(Context);
    const [nearbyCitiesProducts, setNearbyCitiesProducts] = useState([]);
    const [isLoadingNearby, setIsLoadingNearby] = useState(false);

    // Функция для получения ближайших городов
    const getNearbyCities = (currentCity) => {
        // Приоритет городов по регионам
        const cityRegions = {
            'Минск': ['Минск', 'Борисов', 'Молодечно', 'Солигорск', 'Жодино'],
            'Брест': ['Брест', 'Пинск', 'Барановичи', 'Кобрин', 'Лунинец'],
            'Гродно': ['Гродно', 'Лида', 'Слоним', 'Волковыск', 'Щучин'],
            'Гомель': ['Гомель', 'Мозырь', 'Жлобин', 'Речица', 'Светлогорск'],
            'Витебск': ['Витебск', 'Орша', 'Полоцк', 'Новополоцк', 'Поставы'],
            'Могилёв': ['Могилёв', 'Бобруйск', 'Осиповичи', 'Горки', 'Кричев']
        };

        // Находим регион текущего города
        let region = null;
        for (const [regionName, cities] of Object.entries(cityRegions)) {
            if (cities.includes(currentCity)) {
                region = regionName;
                break;
            }
        }

        // Если город не найден в регионах, используем Минск как fallback
        if (!region) {
            region = 'Минск';
        }

        // Возвращаем города из того же региона, исключая текущий
        return cityRegions[region].filter(city => city !== currentCity);
    };

    // Функция для загрузки товаров из ближайших городов
    const loadNearbyCitiesProducts = async (currentCity) => {
        if (!currentCity) return;

        setIsLoadingNearby(true);
        try {
            const nearbyCities = getNearbyCities(currentCity);
            const productsPromises = nearbyCities.map(async (city) => {
                try {
                    const response = await fetch(`http://localhost:5000/api/prod/city/${encodeURIComponent(city)}`);
                    if (response.ok) {
                        const data = await response.json();
                        return {
                            city: city,
                            products: data.slice(0, 6), // Берем первые 6 товаров
                            count: data.length
                        };
                    }
                } catch (error) {
                    console.error(`Ошибка при загрузке товаров для ${city}:`, error);
                }
                return null;
            });

            const results = await Promise.all(productsPromises);
            const validResults = results.filter(result => result && result.products.length > 0);
            setNearbyCitiesProducts(validResults);

        } catch (error) {
            console.error('Ошибка при загрузке товаров из соседних городов:', error);
        } finally {
            setIsLoadingNearby(false);
        }
    };

    // Автоматическая загрузка товаров при монтировании
    useEffect(() => {
        if (!product.products.length && !product.isLoading) {
            if (product.selectedCity) {
                product.fetchProductsByCity(product.selectedCity);
            } else {
                product.fetchProducts();
            }
        }
    }, [product]);

    // Загружаем товары из соседних городов, если в текущем городе ничего нет
    useEffect(() => {
        if (product.products.length === 0 && product.selectedCity && !product.isLoading) {
            loadNearbyCitiesProducts(product.selectedCity);
        } else {
            setNearbyCitiesProducts([]);
        }
    }, [product.products.length, product.selectedCity, product.isLoading]);

    // Состояние загрузки
    if (product.isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">
                    {product.selectedCity 
                        ? `Загружаем товары для города ${product.selectedCity}...`
                        : 'Загружаем товары...'
                    }
                </div>
            </div>
        );
    }

    // Состояние ошибки
    if (product.error) {
        return (
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{product.error}</div>
                <button 
                    className="retry-button"
                    onClick={() => {
                        if (product.selectedCity) {
                            product.fetchProductsByCity(product.selectedCity);
                        } else {
                            product.fetchProducts();
                        }
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    // Проверка на неинициализированное состояние
    if (!product.products || !Array.isArray(product.products)) {
        return (
            <div className="loading-container">
                <div className="loading-text">Загрузка данных...</div>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            {/* Заголовок с информацией о городе и количестве товаров */}
            <div className="product-list-header">
                <h2 className="product-list-title">
                    {product.selectedCity 
                        ? `Товары в городе ${product.selectedCity}`
                        : 'Все товары'
                    }
                </h2>
                {product.products.length > 0 && (
                    <div className="product-count">
                        Найдено товаров: {product.totalCount}
                    </div>
                )}
            </div>

            {/* Основной список товаров */}
            {product.products.length === 0 ? (
                <div className="empty-city-container">
                    <div className="empty-city-content">
                        <div className="empty-city-icon">🏙️</div>
                        <div className="empty-city-title">
                            В городе <strong>{product.selectedCity}</strong> ничего не найдено
                        </div>
                        <div className="empty-city-subtitle">
                            Но вот что есть в nearby городах...
                        </div>

                        {/* Товары из соседних городов */}
                        {isLoadingNearby ? (
                            <div className="nearby-loading">
                                <div className="loading-spinner-small"></div>
                                Ищем товары в nearby городах...
                            </div>
                        ) : nearbyCitiesProducts.length > 0 ? (
                            <div className="nearby-cities-section">
                                {nearbyCitiesProducts.map((cityData, index) => (
                                    <div key={index} className="nearby-city-group">
                                        <div className="nearby-city-header">
                                            <h4 className="nearby-city-name">
                                                🏙️ {cityData.city}
                                            </h4>
                                            <span className="nearby-city-count">
                                                {cityData.count} товаров
                                            </span>
                                        </div>
                                        <div className="nearby-products-grid">
                                            {cityData.products.map(productItem => (
                                                <ProductItem 
                                                    key={`${cityData.city}-${productItem.id}`} 
                                                    product={productItem} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-nearby-products">
                                <div className="no-nearby-icon">🔍</div>
                                <div className="no-nearby-text">
                                    В nearby городах тоже ничего не найдено
                                </div>
                                <button 
                                    className="show-all-button"
                                    onClick={() => product.resetFilters()}
                                >
                                    Показать все товары
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Обычное отображение товаров */
                <>
                    <div className="product-grid">
                        {product.products.map(productItem => (
                            <ProductItem key={productItem.id} product={productItem} />
                        ))}
                    </div>

                    {/* Пагинация */}
                    {product.totalCount > product.limit && (
                        <div className="pagination-container">
                            <div className="pagination-info">
                                Страница {product.page} из {Math.ceil(product.totalCount / product.limit)}
                            </div>
                            <div className="pagination-controls">
                                <button 
                                    className="pagination-button"
                                    disabled={product.page <= 1}
                                    onClick={() => product.setPage(product.page - 1)}
                                >
                                    Назад
                                </button>
                                <button 
                                    className="pagination-button"
                                    disabled={product.page >= Math.ceil(product.totalCount / product.limit)}
                                    onClick={() => product.setPage(product.page + 1)}
                                >
                                    Вперед
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
});

export default ProductList;