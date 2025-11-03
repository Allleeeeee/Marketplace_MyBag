// pages/SellersPage.js
import React, { useState, useEffect, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { useHistory } from 'react-router-dom';
import '../css/pages/SellersPage.css';

const SellersPage = observer(() => {
    const { product } = useContext(Context);
    const history = useHistory();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSellers();
    }, [currentPage, product.selectedCity]);

    const loadSellers = async () => {
        setLoading(true);
        try {
            await product.fetchSellers(product.selectedCity, currentPage, 12);
        } catch (error) {
            console.error('Ошибка при загрузке продавцов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSellerClick = (seller) => {
        history.push(`/seller/${seller.id}`);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const totalPages = Math.ceil(product.sellersTotalCount / 12);

    return (
        <div className="sellers-page">
            <div className="sellers-container">
                <h1 className="sellers-title">
                    {product.selectedCity 
                        ? `Магазины в ${product.selectedCity}`
                        : 'Все магазины'
                    }
                </h1>
                
                {loading ? (
                    <div className="loading">Загрузка магазинов...</div>
                ) : product.sellers && product.sellers.length > 0 ? (
                    <>
                        <div className="sellers-grid">
                            {product.sellers.map(seller => (
                                <div 
                                    key={seller.id} 
                                    className="seller-card"
                                    onClick={() => handleSellerClick(seller)}
                                >
                                    <div className="seller-image">
                                        {seller.img ? (
                                            <img 
                                                src={seller.img} 
                                                alt={seller.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div className="seller-image-placeholder">
                                            Магазин
                                        </div>
                                    </div>
                                    <div className="seller-info">
                                        <h3 className="seller-name">{seller.name}</h3>
                                        <p className="seller-description">
                                            {seller.description || 'Магазин товаров'}
                                        </p>
                                        {seller.rating && (
                                            <div className="seller-rating">
                                                Рейтинг: {seller.rating.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`page-button ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    !loading && (
                        <div className="no-sellers">
                            {product.selectedCity 
                                ? `В городе ${product.selectedCity} пока нет магазинов`
                                : 'Магазины не найдены'
                            }
                        </div>
                    )
                )}
            </div>
        </div>
    );
});

export default SellersPage;