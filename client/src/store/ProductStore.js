// store/ProductStore.js
import { makeAutoObservable } from 'mobx';
import { 
    getAllSellers, 
    getSellerById, 
    getSellerProducts,
    getSellerByUserId 
} from '../http/sellerAPI';
import { 
    getProductsBySeller,
    searchProducts 
} from '../http/productAPI';

class ProductStore {
    products = [];
    totalCount = 0;
    limit = 9;
    page = 1;
    selectedCity = '';
    isLoading = false;
    error = null;
    cities = [];
    currentSearchQuery = '';
    currentFilters = null;
    
    // НОВЫЕ СВОЙСТВА ДЛЯ ПРОДАВЦОВ
    sellers = [];
    selectedSeller = null;
    sellerProducts = [];
    isSellersLoading = false;
    sellersTotalCount = 0;
    sellersPage = 1;
    sellersLimit = 12;

    constructor() {
        makeAutoObservable(this);
        this.initializeCity();
        this.initializeFilters();
    }

    initializeCity() {
        const savedCity = sessionStorage.getItem('city');
        if (savedCity) {
            this.selectedCity = savedCity;
        }
    }

    initializeFilters() {
        const savedFilters = sessionStorage.getItem('productFilters');
        if (savedFilters) {
            try {
                this.currentFilters = JSON.parse(savedFilters);
            } catch (error) {
                console.error('Ошибка при загрузке фильтров:', error);
                this.currentFilters = null;
            }
        }
    }

    // СУЩЕСТВУЮЩИЕ МЕТОДЫ
    setProducts(products) {
        this.products = products;
    }

    setTotalCount(count) {
        this.totalCount = count;
    }

    setPage(page) {
        this.page = page;
    }

    setSelectedCity(city) {
        this.selectedCity = city;
        sessionStorage.setItem('city', city);
    }

    setLoading(loading) {
        this.isLoading = loading;
    }

    setError(error) {
        this.error = error;
    }

    setCities(cities) {
        this.cities = cities;
    }

    setCurrentSearchQuery(query) {
        this.currentSearchQuery = query;
    }

    setCurrentFilters(filters) {
        this.currentFilters = filters;
        try {
            sessionStorage.setItem('productFilters', JSON.stringify(filters));
        } catch (error) {
            console.error('Ошибка при сохранении фильтров:', error);
        }
    }

    // НОВЫЕ МЕТОДЫ ДЛЯ ПРОДАВЦОВ
    setSellers(sellers) {
        this.sellers = sellers;
    }

    setSelectedSeller(seller) {
        this.selectedSeller = seller;
    }

    setSellerProducts(products) {
        this.sellerProducts = products;
    }

    setIsSellersLoading(loading) {
        this.isSellersLoading = loading;
    }

    setSellersTotalCount(count) {
        this.sellersTotalCount = count;
    }

    setSellersPage(page) {
        this.sellersPage = page;
    }

    // ГЕТТЕРЫ
    getCurrentFilters() {
        return this.currentFilters;
    }

    get currentCity() {
        return this.selectedCity || sessionStorage.getItem('city') || 'Выберите город';
    }

    get hasSelectedCity() {
        return !!this.selectedCity;
    }

    get hasActiveSearch() {
        return !!this.currentSearchQuery;
    }

    get hasActiveFilters() {
        return this.currentFilters && (
            this.currentFilters.minPrice || 
            this.currentFilters.maxPrice || 
            this.currentFilters.sortBy !== 'newest' || 
            this.currentFilters.categoryId || 
            (this.currentFilters.characteristics && Object.keys(this.currentFilters.characteristics).length > 0) || 
            this.currentFilters.excludeNoPrice
        );
    }

    // СУЩЕСТВУЮЩИЕ МЕТОДЫ ДЛЯ ПРОДУКТОВ
    clearCurrentFilters() {
        this.currentFilters = null;
        sessionStorage.removeItem('productFilters');
    }

    async fetchCities() {
        try {
            const response = await fetch('http://localhost:5000/api/prod/cities');
            if (response.ok) {
                const data = await response.json();
                this.setCities(data);
                return data;
            }
        } catch (error) {
            console.error('Ошибка при получении городов:', error);
        }
        return [];
    }

    async fetchProducts(filters = {}) {
        this.setLoading(true);
        this.setError(null);
        
        try {
            let url = `http://localhost:5000/api/prod?limit=1000`;
            
            const queryParams = new URLSearchParams();
            
            if (this.selectedCity) {
                queryParams.append('city', this.selectedCity);
            }
            
            if (filters.typeId) {
                queryParams.append('typeId', filters.typeId);
            }
            if (filters.sellerId) {
                queryParams.append('sellerId', filters.sellerId);
            }
            
            const queryString = queryParams.toString();
            if (queryString) {
                url += `&${queryString}`;
            }

            console.log('Fetch URL:', url);

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            let allProducts = data.rows || data;

            if (this.currentSearchQuery) {
                const searchTerm = this.currentSearchQuery.toLowerCase().trim();
                allProducts = allProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.price_text && product.price_text.toLowerCase().includes(searchTerm))
                );
            }

            if (filters.categoryId) {
                allProducts = allProducts.filter(product => 
                    product.type_id == filters.categoryId
                );
            }

            if (filters.characteristics && Object.keys(filters.characteristics).length > 0) {
                allProducts = allProducts.filter(product => {
                    if (!product.info || !Array.isArray(product.info)) return false;
                    
                    return Object.entries(filters.characteristics).every(([charTitle, charValues]) => {
                        const productChar = product.info.find(info => info.title === charTitle);
                        if (!productChar) return false;
                        
                        return charValues.includes(productChar.description);
                    });
                });
            }

            if (filters.minPrice) {
                const minPrice = parseFloat(filters.minPrice);
                allProducts = allProducts.filter(product => {
                    if (product.price === null || product.price === undefined || product.price === 0) {
                        return !filters.excludeNoPrice;
                    }
                    return product.price >= minPrice;
                });
            }

            if (filters.maxPrice) {
                const maxPrice = parseFloat(filters.maxPrice);
                allProducts = allProducts.filter(product => {
                    if (product.price === null || product.price === undefined || product.price === 0) {
                        return !filters.excludeNoPrice;
                    }
                    return product.price <= maxPrice;
                });
            }

            if (filters.excludeNoPrice && !filters.minPrice && !filters.maxPrice) {
                allProducts = allProducts.filter(product => 
                    product.price !== null && 
                    product.price !== undefined && 
                    product.price > 0
                );
            }

            if (filters.sortBy) {
                switch (filters.sortBy) {
                    case 'price_asc':
                        allProducts.sort((a, b) => {
                            const priceA = a.price || 0;
                            const priceB = b.price || 0;
                            return priceA - priceB;
                        });
                        break;
                    case 'price_desc':
                        allProducts.sort((a, b) => {
                            const priceA = a.price || 0;
                            const priceB = b.price || 0;
                            return priceB - priceA;
                        });
                        break;
                    case 'name_asc':
                        allProducts.sort((a, b) => 
                            (a.name || '').localeCompare(b.name || '')
                        );
                        break;
                    case 'name_desc':
                        allProducts.sort((a, b) => 
                            (b.name || '').localeCompare(a.name || '')
                        );
                        break;
                    case 'newest':
                    default:
                        allProducts.sort((a, b) => 
                            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                        );
                        break;
                }
            }

            const startIndex = (this.page - 1) * this.limit;
            const endIndex = startIndex + this.limit;
            const paginatedProducts = allProducts.slice(startIndex, endIndex);

            this.setProducts(paginatedProducts);
            this.setTotalCount(allProducts.length);
            
        } catch (error) {
            console.error('Ошибка при получении продуктов:', error);
            this.setError('Не удалось загрузить товары');
            this.setProducts([]);
            this.setTotalCount(0);
        } finally {
            this.setLoading(false);
        }
    }

    async fetchProductsByCity(city) {
        this.setSelectedCity(city);
        this.setCurrentSearchQuery(''); 
        await this.fetchProducts();
    }

    async searchProducts(searchQuery, filters = {}) {
        this.setCurrentSearchQuery(searchQuery);
        
        const finalFilters = { ...this.currentFilters, ...filters };
        if (Object.keys(finalFilters).length > 0) {
            this.setCurrentFilters(finalFilters);
        }
        
        await this.fetchProducts(finalFilters);
    }

    async changeCity(city) {
        await this.fetchProductsByCity(city);
    }

    async clearSearch() {
        this.setCurrentSearchQuery('');
        await this.fetchProducts(this.currentFilters || {});
    }

    async resetFilters() {
        this.setSelectedCity('');
        this.setCurrentSearchQuery('');
        this.clearCurrentFilters();
        sessionStorage.removeItem('city');
        await this.fetchProducts();
    }

    async applyFilters(filters) {
        this.setCurrentFilters(filters);
        await this.fetchProducts(filters);
    }

    // НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ПРОДАВЦАМИ
    async fetchSellers(city = '', page = 1, limit = 12) {
        this.setIsSellersLoading(true);
        try {
            const params = { page, limit };
            if (city) params.city = city;
            
            const response = await getAllSellers(params);
            this.setSellers(response.rows || response);
            this.setSellersTotalCount(response.count || response.length);
            return response;
        } catch (error) {
            console.error('Ошибка при загрузке продавцов:', error);
            this.setError('Не удалось загрузить список магазинов');
            throw error;
        } finally {
            this.setIsSellersLoading(false);
        }
    }

    async fetchSellerById(sellerId) {
        this.setIsSellersLoading(true);
        try {
            const seller = await getSellerById(sellerId);
            this.setSelectedSeller(seller);
            return seller;
        } catch (error) {
            console.error('Ошибка при загрузке продавца:', error);
            this.setError('Не удалось загрузить информацию о магазине');
            throw error;
        } finally {
            this.setIsSellersLoading(false);
        }
    }

    async fetchSellerProducts(sellerId) {
        try {
            const products = await getSellerProducts(sellerId);
            this.setSellerProducts(products);
            return products;
        } catch (error) {
            console.error('Ошибка при загрузке товаров продавца:', error);
            
            // Если отдельный endpoint не работает, используем общий с фильтром
            try {
                const products = await getProductsBySeller(sellerId);
                this.setSellerProducts(products.rows || products);
                return products;
            } catch (fallbackError) {
                this.setError('Не удалось загрузить товары магазина');
                throw fallbackError;
            }
        }
    }

    async searchSellers(searchQuery) {
        this.setIsSellersLoading(true);
        try {
            // Фильтруем продавцов по имени или описанию
            const allSellers = await getAllSellers();
            const filteredSellers = allSellers.rows?.filter(seller => 
                seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (seller.description && seller.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ) || [];
            
            this.setSellers(filteredSellers);
            return filteredSellers;
        } catch (error) {
            console.error('Ошибка при поиске продавцов:', error);
            throw error;
        } finally {
            this.setIsSellersLoading(false);
        }
    }

    clearSeller() {
        this.setSelectedSeller(null);
        this.setSellerProducts([]);
    }

    clearSellers() {
        this.setSellers([]);
        this.setSelectedSeller(null);
        this.setSellerProducts([]);
        this.setSellersPage(1);
    }
}

export const productStore = new ProductStore();