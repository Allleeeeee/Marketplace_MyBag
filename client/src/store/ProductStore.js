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
// В ProductStore.js добавьте метод
async fetchProductsFromMultipleCities(cities) {
    this.setLoading(true);
    this.setError(null);
    
    try {
        const promises = cities.map(city => 
            fetch(`http://localhost:5000/api/prod/city/${encodeURIComponent(city)}`)
                .then(response => response.ok ? response.json() : [])
                .catch(() => [])
        );

        const results = await Promise.all(promises);
        const allProducts = results.flat();
        
        this.setProducts(allProducts);
        this.setTotalCount(allProducts.length);
        
    } catch (error) {
        console.error('Ошибка при загрузке товаров из нескольких городов:', error);
        this.setError('Не удалось загрузить товары');
    } finally {
        this.setLoading(false);
    }
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

    // Получение всех продуктов (с пагинацией и фильтрами)
    async fetchProducts(filters = {}) {
        this.setLoading(true);
        this.setError(null);
        
        try {
            let url = `http://localhost:5000/api/prod?page=${this.page}&limit=${this.limit}`;
            
            const queryParams = new URLSearchParams();
            
            if (filters.typeId) {
                queryParams.append('typeId', filters.typeId);
            }
            if (filters.sellerId) {
                queryParams.append('sellerId', filters.sellerId);
            }
            if (this.selectedCity) {
                queryParams.append('city', this.selectedCity);
            }
            
            const queryString = queryParams.toString();
            if (queryString) {
                url += `&${queryString}`;
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.setProducts(data.rows || data);
            this.setTotalCount(data.count || data.length);
            
        } catch (error) {
            console.error('Ошибка при получении продуктов:', error);
            this.setError('Не удалось загрузить товары');
            this.setProducts([]);
            this.setTotalCount(0);
        } finally {
            this.setLoading(false);
        }
    }

    // Получение продуктов по конкретному городу
    async fetchProductsByCity(city) {
        this.setLoading(true);
        this.setError(null);
        this.setSelectedCity(city);
        
        try {
            const response = await fetch(`http://localhost:5000/api/prod/city/${encodeURIComponent(city)}`);
            
            if (!response.ok) {
                // Если товаров для города нет, пробуем загрузить все
                await this.fetchProducts();
                return;
            }
            
            const data = await response.json();
            this.setProducts(data);
            this.setTotalCount(data.length);
            
        } catch (error) {
            console.error('Ошибка при получении продуктов по городу:', error);
            this.setError(`Не удалось загрузить товары для города ${city}`);
            await this.fetchProducts();
        } finally {
            this.setLoading(false);
        }
    }

    // Получение одного продукта по ID
    async fetchProductById(id) {
        this.setLoading(true);
        this.setError(null);
        
        try {
            const response = await fetch(`http://localhost:5000/api/prod/prod/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('Ошибка при получении продукта:', error);
            this.setError('Не удалось загрузить информацию о товаре');
            return null;
        } finally {
            this.setLoading(false);
        }
    }

    // Сброс фильтров
    async resetFilters() {
        this.setSelectedCity('');
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
}

// Создаем экземпляр store
export const productStore = new ProductStore();