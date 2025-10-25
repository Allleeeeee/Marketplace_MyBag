// store/ProductStore.js
import { makeAutoObservable } from 'mobx';

class ProductStore {
    products = [];
    totalCount = 0;
    limit = 2;
    page = 1;

    constructor() {
        makeAutoObservable(this);
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

    // Убрал стрелочную функцию
    async fetchProducts() {
        try {
            const response = await fetch(`http://localhost:5000/api/prod?page=${this.page}&limit=${this.limit}`);
            const data = await response.json();
            this.setProducts(data.rows);
            this.setTotalCount(data.count);
        } catch (error) {
            console.error('Ошибка при получении продуктов:', error);
        }
    }

    // Убрал стрелочную функцию
    async fetchProductsByCity(city) {
        try {
            const response = await fetch(`http://localhost:5000/api/prod/city/${city}`);
            const data = await response.json();
            this.setProducts(data);
            this.setTotalCount(data.length);
        } catch (error) {
            console.error('Ошибка при получении продуктов по городу:', error);
        }
    }
}

export const productStore = new ProductStore();