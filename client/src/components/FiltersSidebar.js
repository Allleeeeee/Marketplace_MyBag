import React, { useState, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import '../css/components/SearchBar.css';

const FiltersSidebar = observer(() => {
    const { product } = useContext(Context);
    const [categories, setCategories] = useState([]);
    const [characteristics, setCharacteristics] = useState([]);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sortBy: 'newest',
        categoryId: '',
        characteristics: {},
        excludeNoPrice: false
    });
    const [errors, setErrors] = useState({});
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        loadCategories();
        if (product.currentFilters) {
            setFilters(product.currentFilters);
        }
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/prod/types');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    };

    useEffect(() => {
        if (filters.categoryId) {
            loadCharacteristics(filters.categoryId);
        } else {
            setCharacteristics([]);
        }
    }, [filters.categoryId]);

    const loadCharacteristics = async (categoryId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/prod?typeId=${categoryId}&limit=50`);
            if (response.ok) {
                const data = await response.json();
                const products = data.rows || data;
                
                const uniqueCharacteristics = {};
                products.forEach(product => {
                    if (product.info && Array.isArray(product.info)) {
                        product.info.forEach(info => {
                            if (!uniqueCharacteristics[info.title]) {
                                uniqueCharacteristics[info.title] = new Set();
                            }
                            uniqueCharacteristics[info.title].add(info.description);
                        });
                    }
                });

                const charArray = Object.entries(uniqueCharacteristics).map(([title, values]) => ({
                    title,
                    values: Array.from(values)
                }));

                setCharacteristics(charArray);
            }
        } catch (error) {
            console.error('Ошибка при загрузке характеристик:', error);
        }
    };

    const validateFilters = () => {
        const newErrors = {};

        if (filters.minPrice && (isNaN(filters.minPrice) || parseFloat(filters.minPrice) < 0)) {
            newErrors.minPrice = 'Минимальная цена должна быть положительным числом';
        }

        if (filters.maxPrice && (isNaN(filters.maxPrice) || parseFloat(filters.maxPrice) < 0)) {
            newErrors.maxPrice = 'Максимальная цена должна быть положительным числом';
        }

        if (filters.minPrice && filters.maxPrice) {
            const min = parseFloat(filters.minPrice);
            const max = parseFloat(filters.maxPrice);
            if (min > max) {
                newErrors.priceRange = 'Минимальная цена не может быть больше максимальной';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const clearFilters = async () => {
        const clearedFilters = {
            minPrice: '',
            maxPrice: '',
            sortBy: 'newest',
            categoryId: '',
            characteristics: {},
            excludeNoPrice: false
        };
        
        setFilters(clearedFilters);
        setErrors({});
        setCharacteristics([]);
        
        setIsApplying(true);
        try {
            product.setCurrentFilters(clearedFilters);
            
            if (product.currentSearchQuery) {
                await product.searchProducts(product.currentSearchQuery, clearedFilters);
            } else {
                await product.fetchProducts(clearedFilters);
            }
        } catch (error) {
            console.error('Ошибка при сбросе фильтров:', error);
        } finally {
            setIsApplying(false);
        }
    };

    const clearError = (fieldName) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            ...filters,
            [filterType]: value
        };
        setFilters(newFilters);

        if (errors[filterType]) {
            clearError(filterType);
        }
        if (errors.priceRange && (filterType === 'minPrice' || filterType === 'maxPrice')) {
            clearError('priceRange');
        }

        validateFilters();
    };

    const handleCharacteristicChange = (charTitle, charValue, checked) => {
        const newCharacteristics = { ...filters.characteristics };
        
        if (checked) {
            if (!newCharacteristics[charTitle]) {
                newCharacteristics[charTitle] = [];
            }
            if (!newCharacteristics[charTitle].includes(charValue)) {
                newCharacteristics[charTitle].push(charValue);
            }
        } else {
            if (newCharacteristics[charTitle]) {
                newCharacteristics[charTitle] = newCharacteristics[charTitle].filter(v => v !== charValue);
                if (newCharacteristics[charTitle].length === 0) {
                    delete newCharacteristics[charTitle];
                }
            }
        }

        const newFilters = {
            ...filters,
            characteristics: newCharacteristics
        };
        setFilters(newFilters);

        validateFilters();
    };

    const applyFilters = async () => {
        if (!validateFilters()) {
            return;
        }

        setIsApplying(true);
        try {
            product.setCurrentFilters(filters);
            
            if (product.currentSearchQuery) {
                await product.searchProducts(product.currentSearchQuery, filters);
            } else {
                await product.fetchProducts(filters);
            }
        } catch (error) {
            console.error('Ошибка при применении фильтров:', error);
        } finally {
            setIsApplying(false);
        }
    };

    useEffect(() => {
        if (filters.categoryId && product.currentFilters && product.currentFilters.characteristics) {
            setFilters(prev => ({
                ...prev,
                characteristics: product.currentFilters.characteristics
            }));
        }
    }, [filters.categoryId, product.currentFilters]);

    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.sortBy !== 'newest' || 
                            filters.categoryId || Object.keys(filters.characteristics).length > 0 || filters.excludeNoPrice;

    return (
        <div className="filters-sidebar">
            <div className="filters-header">
                <h3 className="filters-title">Фильтры</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="clear-filters-button"
                        disabled={isApplying}
                    >
                        {isApplying ? '...' : 'Сбросить'}
                    </button>
                )}
            </div>

            {errors.priceRange && (
                <div className="filter-error general-error">
                    ⚠️ {errors.priceRange}
                </div>
            )}

            <div className="filters-vertical">
                <div className="filter-group">
                    <label className="filter-label">Категория</label>
                    <select
                        value={filters.categoryId}
                        onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                        className="filter-select"
                        disabled={isApplying}
                    >
                        <option value="">Все категории</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-checkbox">
                        <input
                            type="checkbox"
                            checked={filters.excludeNoPrice}
                            onChange={(e) => handleFilterChange('excludeNoPrice', e.target.checked)}
                            className="checkbox-input"
                            disabled={isApplying}
                        />
                        <span className="checkbox-text">Только товары с ценой</span>
                    </label>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Цена, ₽</label>
                    <div className="price-inputs-vertical">
                        <div className="price-input-group">
                            <input
                                type="number"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                placeholder="От"
                                className={`price-input ${errors.minPrice ? 'error' : ''}`}
                                min="0"
                                step="0.01"
                                disabled={isApplying}
                            />
                        </div>
                        <div className="price-input-group">
                            <input
                                type="number"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                placeholder="До"
                                className={`price-input ${errors.maxPrice ? 'error' : ''}`}
                                min="0"
                                step="0.01"
                                disabled={isApplying}
                            />
                        </div>
                    </div>
                    {errors.minPrice && (
                        <div className="filter-error">⚠️ {errors.minPrice}</div>
                    )}
                    {errors.maxPrice && (
                        <div className="filter-error">⚠️ {errors.maxPrice}</div>
                    )}
                </div>

                <div className="filter-group">
                    <label className="filter-label">Сортировка</label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="filter-select"
                        disabled={isApplying}
                    >
                        <option value="newest">Сначала новые</option>
                        <option value="price_asc">Цена по возрастанию</option>
                        <option value="price_desc">Цена по убыванию</option>
                        <option value="name_asc">По названию (А-Я)</option>
                        <option value="name_desc">По названию (Я-А)</option>
                    </select>
                </div>

                {characteristics.length > 0 && (
                    <div className="characteristics-section">
                        <h4 className="characteristics-title">Характеристики</h4>
                        <div className="characteristics-vertical">
                            {characteristics.map(char => (
                                <div key={char.title} className="characteristic-group">
                                    <label className="characteristic-label">{char.title}</label>
                                    <div className="characteristic-values">
                                        {char.values.map(value => (
                                            <label key={value} className="characteristic-value">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.characteristics[char.title]?.includes(value) || false}
                                                    onChange={(e) => handleCharacteristicChange(char.title, value, e.target.checked)}
                                                    className="characteristic-checkbox"
                                                    disabled={isApplying}
                                                />
                                                <span className="characteristic-text">{value}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="filter-actions">
                    <button
                        onClick={applyFilters}
                        className="apply-filters-button"
                        disabled={isApplying || Object.keys(errors).length > 0}
                    >
                        {isApplying ? (
                            <div className="apply-spinner"></div>
                        ) : (
                            'Применить фильтры'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default FiltersSidebar;