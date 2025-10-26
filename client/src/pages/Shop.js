import React, { useEffect, useContext } from 'react';
import ProductList from "../components/ProductList"; 
import Pages from '../components/Pages';
import { observer } from "mobx-react-lite";
import { Context } from '../index';
import '../css/pages/Shop.css'; 

const Shop = observer(() => {
    const { product } = useContext(Context);

    useEffect(() => {
        const city = sessionStorage.getItem('city') || '';
        if (city) {
            product.fetchProductsByCity(city);
        } else {
            product.fetchProducts();
        }
    }, [product.page]);

    return (
        <div className="shop-container">
            <div className="shop-content">
                <ProductList />
                {product.totalCount > product.limit && (
                    <div >
                        <Pages />
                    </div>
                )}
            </div>
        </div>
    );
});

export default Shop;