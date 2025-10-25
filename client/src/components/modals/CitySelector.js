import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Spinner } from 'react-bootstrap';

const CitySelectorModal = ({ show, handleClose, cities, selectedCity, handleCityChange }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [mapUrl, setMapUrl] = useState('');
    const [isMapLoading, setIsMapLoading] = useState(false);

    // Генерируем URL для статичной карты OpenStreetMap
    const generateMapUrl = (cityName) => {
        // Простая статичная карта Беларуси
        return `https://static-maps.yandex.ru/1.x/?ll=27.561481,53.902496&z=6&l=map&size=400,300`;
    };

    useEffect(() => {
        if (show && activeTab === 'map') {
            setMapUrl(generateMapUrl());
        }
    }, [show, activeTab]);

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
    };

    const handleCitySelectFromMap = (cityName) => {
        // Создаем искусственное событие для совместимости с handleCityChange
        const mockEvent = {
            target: { value: cityName }
        };
        handleCityChange(mockEvent);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Выберите город</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
                    <Tab eventKey="list" title="Список городов">
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="citySelect" className="form-label">
                                Выберите город из списка:
                            </label>
                            <select 
                                id="citySelect"
                                value={selectedCity} 
                                onChange={handleCityChange} 
                                className="form-select"
                                style={{ width: '100%' }}
                            >
                                <option value="" disabled>Выберите город</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {cities.length === 0 && (
                            <div className="text-center text-muted">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Загрузка городов...
                            </div>
                        )}
                    </Tab>

                    <Tab eventKey="map" title="На карте">
                        <div style={{ marginBottom: '15px' }}>
                            <p className="text-muted">
                                Выберите город кликом по названию на карте:
                            </p>
                            
                            {/* Простая интерактивная карта через изображение с кликабельными областями */}
                            <div 
                                style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    height: '300px',
                                    backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Belarus_%28centered%29.svg/800px-Belarus_%28centered%29.svg.png)',
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    borderRadius: '4px'
                                }}
                            >
                                {/* Кликабельные области для основных городов Беларуси */}
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '30%',
                                        left: '40%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Минск')}
                                    title="Минск"
                                >
                                    Минск
                                </button>
                                
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '60%',
                                        left: '25%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Брест')}
                                    title="Брест"
                                >
                                    Брест
                                </button>
                                
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '35%',
                                        left: '60%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Могилёв')}
                                    title="Могилёв"
                                >
                                    Могилёв
                                </button>
                                
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '25%',
                                        left: '50%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Гродно')}
                                    title="Гродно"
                                >
                                    Гродно
                                </button>
                                
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '45%',
                                        left: '70%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Гомель')}
                                    title="Гомель"
                                >
                                    Гомель
                                </button>
                                
                                <button
                                    style={{
                                        position: 'absolute',
                                        top: '20%',
                                        left: '65%',
                                        background: 'none',
                                        border: 'none',
                                        color: '#007bff',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        padding: '2px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(255,255,255,0.8)'
                                    }}
                                    onClick={() => handleCitySelectFromMap('Витебск')}
                                    title="Витебск"
                                >
                                    Витебск
                                </button>
                            </div>
                            
                            <div className="mt-2">
                                <small className="text-muted">
                                    Основные города Беларуси. Для других городов используйте список.
                                </small>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Закрыть
                </Button>
                {activeTab === 'list' && selectedCity && (
                    <Button variant="primary" onClick={handleClose}>
                        Выбрать {selectedCity}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default CitySelectorModal;