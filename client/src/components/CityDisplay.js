// components/CityDisplay.js
import React, { useEffect, useState, useContext } from 'react';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import geo from '../assets/geo.png'; 
import CitySelectorModal from './modals/CitySelector';

const CityDisplay = observer(() => {
    const { product } = useContext(Context);
    const [showModal, setShowModal] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Загружаем города при монтировании
    useEffect(() => {
        const loadCities = async () => {
            await product.fetchCities();
            
            // Если в store уже есть выбранный город, используем его
            if (product.selectedCity) {
                return;
            }
            
            // Иначе пытаемся восстановить из sessionStorage или использовать первый город
            const savedCity = sessionStorage.getItem('city');
            if (savedCity && product.cities.includes(savedCity)) {
                await product.fetchProductsByCity(savedCity);
            } else if (product.cities.length > 0) {
                await product.fetchProductsByCity(product.cities[0]);
            }
        };

        loadCities();
    }, [product]);

    // Определение местоположения
    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            console.log('Геолокация не поддерживается');
            return;
        }

        setIsDetectingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/prod/geocode?lat=${latitude}&lng=${longitude}`
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        const currentCity = data.city;
                        
                        if (product.cities.includes(currentCity)) {
                            await product.fetchProductsByCity(currentCity);
                            handleCloseModal();
                        } else {
                            console.log('Определенный город не найден в списке:', currentCity);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка при определении города:', error);
                }
                setIsDetectingLocation(false);
            },
            async (error) => {
                console.error('Ошибка геолокации:', error);
                setIsDetectingLocation(false);
            }
        );
    };

    const handleCityChange = async (e) => {
        const newCity = e.target.value;
        await product.fetchProductsByCity(newCity);
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDetectLocation = () => {
        getCurrentLocation();
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <img 
                src={geo} 
                style={{ 
                    width: '24px', 
                    height: '24px', 
                    opacity: product.isLoading ? 0.6 : 1
                }} 
                alt="Геолокация" 
                onClick={handleOpenModal}
            />
            <div onClick={handleOpenModal}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>Ваш город</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {product.isLoading ? 'Загрузка...' : product.currentCity}
                </span>
            </div>
            
            <CitySelectorModal 
                show={showModal} 
                handleClose={handleCloseModal}
                cities={product.cities}
                selectedCity={product.selectedCity}
                handleCityChange={handleCityChange}
                onDetectLocation={handleDetectLocation}
                isLoading={isDetectingLocation}
            />
        </div>
    );
});

export default CityDisplay;