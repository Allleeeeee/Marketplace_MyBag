// components/modals/CitySelector.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Tab, Spinner, Form, Alert } from 'react-bootstrap';

const CitySelectorModal = ({ 
    show, 
    handleClose, 
    cities, 
    selectedCity, 
    handleCityChange,
    onDetectLocation,
    isLoading 
}) => {
    const [activeTab, setActiveTab] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);
    const [mapError, setMapError] = useState('');

    // Фильтрация городов при поиске
    useEffect(() => {
        if (searchTerm) {
            const filtered = cities.filter(city => 
                city.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities(cities);
        }
    }, [searchTerm, cities]);

    const handleTabSelect = (tab) => {
        setActiveTab(tab);
        setMapError('');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCitySelect = (city) => {
        const mockEvent = {
            target: { value: city }
        };
        handleCityChange(mockEvent);
        handleClose();
    };

    // Правильные координаты для городов Беларуси (в процентах от размеров контейнера)
    const cityCoordinates = {
        'Минск': { top: '43%', left: '45%' },
        'Брест': { top: '68%', left: '25%' },
        'Гродно': { top: '35%', left: '30%' },
        'Гомель': { top: '55%', left: '70%' },
        'Витебск': { top: '25%', left: '60%' },
        'Могилёв': { top: '45%', left: '65%' },
        'Барановичи': { top: '52%', left: '38%' },
        'Борисов': { top: '40%', left: '50%' },
        'Пинск': { top: '62%', left: '32%' },
        'Орша': { top: '35%', left: '55%' },
        'Лида': { top: '38%', left: '35%' },
        'Новополоцк': { top: '28%', left: '55%' },
        'Полоцк': { top: '30%', left: '53%' },
        'Молодечно': { top: '38%', left: '42%' },
        'Солигорск': { top: '50%', left: '42%' },
        'Жлобин': { top: '52%', left: '62%' }
    };

    // Функция для рендеринга кнопок городов на карте
    const renderCityButtons = () => {
        return Object.entries(cityCoordinates).map(([cityName, coords]) => {
            // Показываем только те города, которые есть в списке
            if (!cities.includes(cityName)) return null;

            const isSelected = selectedCity === cityName;
            
            return (
                <button
                    key={cityName}
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        background: isSelected ? '#007bff' : 'rgba(255, 255, 255, 0.95)',
                        border: `2px solid ${isSelected ? '#0056b3' : '#007bff'}`,
                        color: isSelected ? 'white' : '#007bff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        minWidth: '80px',
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Arial, sans-serif',
                        textShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                    }}
                    onClick={() => handleCitySelect(cityName)}
                    title={`Выбрать ${cityName}`}
                    onMouseEnter={(e) => {
                        if (!isSelected) {
                            e.target.style.background = '#e3f2fd';
                            e.target.style.transform = 'translate(-50%, -50%) scale(1.15)';
                            e.target.style.boxShadow = '0 5px 15px rgba(0, 123, 255, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) {
                            e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                            e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                            e.target.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
                        }
                    }}
                >
                    {cityName}
                </button>
            );
        });
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <Modal.Title style={{ color: '#333', fontWeight: '600' }}>
                    🗺️ Выберите ваш город
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{ padding: '25px' }}>
                {mapError && (
                    <Alert variant="warning" className="mb-3">
                        {mapError}
                    </Alert>
                )}
                
                <Tabs 
                    activeKey={activeTab} 
                    onSelect={handleTabSelect} 
                    className="mb-4"
                    style={{ borderBottom: '2px solid #dee2e6' }}
                >
                    {/* Вкладка со списком городов */}
                    <Tab eventKey="list" title={
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            📋 Список городов
                        </span>
                    }>
                        <div style={{ marginBottom: '20px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Button 
                                    variant="outline-primary" 
                                    onClick={onDetectLocation}
                                    disabled={isLoading}
                                    size="sm"
                                    style={{ borderRadius: '20px', fontWeight: '600' }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Определяем...
                                        </>
                                    ) : (
                                        '🎯 Определить автоматически'
                                    )}
                                </Button>
                                
                                {selectedCity && (
                                    <span className="text-success" style={{ fontWeight: '600' }}>
                                        ✅ Выбран: {selectedCity}
                                    </span>
                                )}
                            </div>

                            <Form.Group>
                                <Form.Label style={{ fontWeight: '600', color: '#555' }}>
                                    🔍 Поиск города:
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Введите название города..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{ 
                                        borderRadius: '10px', 
                                        border: '2px solid #e9ecef',
                                        padding: '12px 15px',
                                        fontSize: '14px'
                                    }}
                                />
                            </Form.Group>
                        </div>

                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e9ecef', borderRadius: '10px' }}>
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                                <strong style={{ color: '#555' }}>
                                    Доступные города ({filteredCities.length})
                                </strong>
                            </div>
                            
                            {filteredCities.length > 0 ? (
                                <div className="list-group" style={{ borderRadius: '0 0 10px 10px' }}>
                                    {filteredCities.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            className={`list-group-item list-group-item-action ${
                                                selectedCity === city ? 'active' : ''
                                            }`}
                                            onClick={() => handleCitySelect(city)}
                                            style={{
                                                border: 'none',
                                                borderBottom: '1px solid #f8f9fa',
                                                borderRadius: '0',
                                                padding: '15px 20px',
                                                fontSize: '14px',
                                                fontWeight: selectedCity === city ? '600' : '400'
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>{city}</span>
                                                {selectedCity === city && (
                                                    <span 
                                                        className="badge" 
                                                        style={{ 
                                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                                            color: 'white',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        ✓ Выбран
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5">
                                    {searchTerm ? (
                                        <div>
                                            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                                            <div style={{ fontSize: '16px', marginBottom: '5px' }}>Город "{searchTerm}" не найден</div>
                                            <small>Попробуйте изменить запрос или выберите из списка</small>
                                        </div>
                                    ) : (
                                        <div>
                                            <Spinner animation="border" className="me-2" />
                                            <div className="mt-2">Загрузка списка городов...</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Tab>

                    {/* Вкладка с картой */}
                    <Tab eventKey="map" title={
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            🗺️ Выбрать на карте
                        </span>
                    }>
                        <div style={{ marginBottom: '15px' }}>
                            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
                                💡 <strong>Наведите курсор на город и кликните для выбора</strong>
                            </p>
                            
                            {/* Контейнер карты */}
                            <div 
                                style={{ 
                                    position: 'relative', 
                                    width: '100%', 
                                    height: '450px',
                                    backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Belarus_%28centered%29.svg/1200px-Belarus_%28centered%29.svg.png')`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center center',
                                    backgroundColor: '#e8f4f8',
                                    border: '3px solid #dee2e6',
                                    borderRadius: '12px',
                                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                                    backgroundBlendMode: 'multiply'
                                }}
                            >
                                {renderCityButtons()}
                                
                                {/* Легенда карты */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        bottom: '15px',
                                        left: '15px',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        border: '1px solid #ddd',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        fontWeight: '600'
                                    }}
                                >
                                    🗺️ Карта Беларуси
                                </div>
                                
                                {/* Подсказка */}
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        background: 'rgba(40, 167, 69, 0.9)',
                                        color: 'white',
                                        padding: '8px 12px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '600'
                                    }}
                                >
                                    🎯 Кликните на город
                                </div>
                            </div>
                            
                            <div className="mt-3 text-center">
                                <small className="text-muted">
                                    Основные города Беларуси. Для полного списка используйте вкладку "Список городов"
                                </small>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>
            
            <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6', padding: '20px' }}>
                <div className="w-100 d-flex justify-content-between align-items-center">
                    <div>
                        {selectedCity ? (
                            <span style={{ color: '#28a745', fontWeight: '600', fontSize: '16px' }}>
                                ✅ Город выбран: <strong>{selectedCity}</strong>
                            </span>
                        ) : (
                            <span style={{ color: '#6c757d', fontWeight: '500' }}>
                                ⚠️ Выберите город для продолжения
                            </span>
                        )}
                    </div>
                    <div>
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose} 
                            className="me-2"
                            style={{ borderRadius: '8px', fontWeight: '600' }}
                        >
                            Отмена
                        </Button>
                        {selectedCity && (
                            <Button 
                                variant="primary" 
                                onClick={handleClose}
                                style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 20px' }}
                            >
                                ✅ Выбрать {selectedCity}
                            </Button>
                        )}
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CitySelectorModal;