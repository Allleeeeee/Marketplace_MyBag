// store/ProductStore.js
import { makeAutoObservable } from 'mobx';

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

    constructor() {
        makeAutoObservable(this);
        this.initializeCity();
    }

    // Инициализация города при загрузке store
    initializeCity() {
        const savedCity = sessionStorage.getItem('city');
        if (savedCity) {
            this.selectedCity = savedCity;
        }
    }

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

    // Получение списка городов из БД
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

  // store/ProductStore.js - обновленный метод fetchProducts
async fetchProducts(filters = {}) {
    this.setLoading(true);
    this.setError(null);
    
    try {
        let url = `http://localhost:5000/api/prod?page=${this.page}&limit=${this.limit}`;
        
        const queryParams = new URLSearchParams();
        
        // Добавляем город если выбран
        if (this.selectedCity) {
            queryParams.append('city', this.selectedCity);
        }
        
        // Добавляем другие фильтры
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
        let products = data.rows || data;
        let totalCount = data.count || data.length;

        // ФИЛЬТРАЦИЯ НА ФРОНТЕНДЕ - временное решение
        if (this.currentSearchQuery) {
            const searchTerm = this.currentSearchQuery.toLowerCase().trim();
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.price_text && product.price_text.toLowerCase().includes(searchTerm))
            );
            totalCount = products.length;
        }

        this.setProducts(products);
        this.setTotalCount(totalCount);
        
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error);
        this.setError('Не удалось загрузить товары');
        this.setProducts([]);
        this.setTotalCount(0);
    } finally {
        this.setLoading(false);
    }
}

    // Получение продуктов по конкретному городу (для обратной совместимости)
    async fetchProductsByCity(city) {
        this.setSelectedCity(city);
        this.setCurrentSearchQuery(''); // Сбрасываем поиск при смене города
        await this.fetchProducts();
    }

    // Поиск товаров - использует fetchProducts
    async searchProducts(searchQuery) {
        this.setCurrentSearchQuery(searchQuery);
        await this.fetchProducts();
    }

    // Смена города - использует fetchProducts
    async changeCity(city) {
        await this.fetchProductsByCity(city);
    }

    // Сброс поиска
    async clearSearch() {
        this.setCurrentSearchQuery('');
        await this.fetchProducts();
    }

    // Сброс всех фильтров
    async resetFilters() {
        this.setSelectedCity('');
        this.setCurrentSearchQuery('');
        sessionStorage.removeItem('city');
        await this.fetchProducts();
    }

    // Получение текущего города
    get currentCity() {
        return this.selectedCity || sessionStorage.getItem('city') || 'Выберите город';
    }

    // Есть ли выбранный город
    get hasSelectedCity() {
        return !!this.selectedCity;
    }

    // Есть ли активный поиск
    get hasActiveSearch() {
        return !!this.currentSearchQuery;
    }
}

// Создаем экземпляр store
export const productStore = new ProductStore();