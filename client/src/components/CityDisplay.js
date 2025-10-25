import React, { useEffect, useState, useContext } from 'react';
import geo from '../assets/geo.png'; 
import CitySelectorModal from '../components/modals/CitySelector';
import { Context } from '../index';

const CityDisplay = () => {
    const { product } = useContext(Context);
    const [city, setCity] = useState('Выберите город'); 
    const [selectedCity, setSelectedCity] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Получаем текущее местоположение пользователя
    useEffect(() => {
        const getCurrentLocation = () => {
            if (navigator.geolocation) {
                setIsLoading(true);
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        try {
                            // Пробуем определить город через наш бэкенд
                            const response = await fetch(`http://localhost:5000/api/products/geocode?lat=${latitude}&lng=${longitude}`);
                            if (response.ok) {
                                const data = await response.json();
                                const currentCity = data.city;
                                setCity(currentCity);
                                setSelectedCity(currentCity);
                                sessionStorage.setItem('city', currentCity);
                            }
                        } catch (error) {
                            console.error('Ошибка при определении города:', error);
                            // Fallback на внешний API
                            try {
                                const backupResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`);
                                const backupData = await backupResponse.json();
                                const currentCity = backupData.city || backupData.locality || 'Неизвестный город';
                                setCity(currentCity);
                                setSelectedCity(currentCity);
                                sessionStorage.setItem('city', currentCity);
                            } catch (backupError) {
                                console.error('Ошибка резервного определения города:', backupError);
                            }
                        }
                        setIsLoading(false);
                    },
                    (error) => {
                        console.error('Ошибка геолокации:', error);
                        setIsLoading(false);
                        // Если геолокация недоступна, используем сохраненный город
                        const savedCity = sessionStorage.getItem('city');
                        if (savedCity) {
                            setCity(savedCity);
                            setSelectedCity(savedCity);
                        }
                    }
                );
            } else {
                console.log('Геолокация не поддерживается');
                const savedCity = sessionStorage.getItem('city');
                if (savedCity) {
                    setCity(savedCity);
                    setSelectedCity(savedCity);
                }
            }
        };

        getCurrentLocation();
    }, []);

    // Получаем список городов из базы данных
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products/cities');
                if (response.ok) {
                    const data = await response.json();
                    setCities(data);
                }
            } catch (error) {
                console.error('Ошибка при получении городов:', error);
            }
        };

        fetchCities();
    }, []);

    const handleCityChange = async (e) => {
        const newCity = e.target.value;
        setSelectedCity(newCity);
        setCity(newCity);
        sessionStorage.setItem('city', newCity);

        // Загружаем товары для выбранного города
        if (product && product.fetchProductsByCity) {
            await product.fetchProductsByCity(newCity);
        }
    };

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <img 
                src={geo} 
                style={{ 
                    width: '24px', 
                    height: '24px', 
                    opacity: isLoading ? 0.6 : 1
                }} 
                alt="Геолокация" 
                onClick={handleOpenModal}
            />
            <div onClick={handleOpenModal}>
                <span style={{ fontSize: '12px', color: '#666', display: 'block' }}>Ваш город</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                    {isLoading ? 'Определяем...' : city}
                </span>
            </div>
            
            <CitySelectorModal 
                show={showModal} 
                handleClose={handleCloseModal}
                cities={cities}
                selectedCity={selectedCity}
                handleCityChange={handleCityChange}
            />
        </div>
    );
};

export default CityDisplay;