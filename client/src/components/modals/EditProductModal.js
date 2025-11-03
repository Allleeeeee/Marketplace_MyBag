// components/EditProductModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { getTypes, getBelarusCities } from '../../http/productAPI';
import '../../css/components/EditProductModal.css';

const EditProductModal = ({ show, onHide, product, onUpdate, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        city: '',
        typeId: '',
        img: null,
        priceType: 'fixed',
        priceText: '',
        currency: 'BYN'
    });
    
    const [characteristics, setCharacteristics] = useState([
        { title: '', description: '' }
    ]);
    
    const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [typesData, citiesData] = await Promise.all([
                    getTypes(),
                    getBelarusCities()
                ]);
                setTypes(typesData);
                setCities(citiesData);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Ошибка загрузки данных');
            }
        };

        if (show) {
            loadData();
        }
    }, [show]);

    useEffect(() => {
        if (product && show) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                description: product.description || '',
                city: product.city || '',
                typeId: product.type_id || '',
                img: null,
                priceType: product.price_type || 'fixed',
                priceText: product.price_text || '',
                currency: product.currency || 'BYN'
            });
            
            setImagePreview(product.img || '');
            
            // Загружаем характеристики товара
            if (product.info && product.info.length > 0) {
                setCharacteristics(product.info.map(info => ({
                    title: info.title || '',
                    description: info.description || ''
                })));
            } else {
                setCharacteristics([{ title: '', description: '' }]);
            }
        }
    }, [product, show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePriceTypeChange = (priceType) => {
        setFormData(prev => ({
            ...prev,
            priceType,
            price: priceType === 'fixed' ? prev.price : '',
            priceText: priceType === 'custom' ? prev.priceText : '',
            currency: priceType === 'fixed' ? prev.currency : 'BYN'
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Размер изображения не должен превышать 5MB');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите файл изображения');
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                img: file
            }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleCharacteristicChange = (index, field, value) => {
        const updatedCharacteristics = [...characteristics];
        updatedCharacteristics[index][field] = value;
        setCharacteristics(updatedCharacteristics);
    };

    const addCharacteristic = () => {
        setCharacteristics([...characteristics, { title: '', description: '' }]);
    };

    const removeCharacteristic = (index) => {
        if (characteristics.length > 1) {
            const updatedCharacteristics = [...characteristics];
            updatedCharacteristics.splice(index, 1);
            setCharacteristics(updatedCharacteristics);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            return 'Название товара обязательно';
        }
        
        if (formData.priceType === 'fixed' && (!formData.price || parseFloat(formData.price) <= 0)) {
            return 'Для фиксированной цены укажите положительное число';
        }
        
        if (formData.priceType === 'custom' && !formData.priceText.trim()) {
            return 'Для кастомной цены укажите текст';
        }
        
        if (!formData.city.trim()) {
            return 'Город обязателен';
        }
        
        if (!formData.typeId) {
            return 'Выберите тип товара';
        }
        
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');

        const productData = new FormData();
        productData.append('name', formData.name.trim());
        productData.append('price', formData.price);
        productData.append('typeId', formData.typeId);
        productData.append('city', formData.city.trim());
        productData.append('description', formData.description.trim());
        productData.append('priceType', formData.priceType);
        productData.append('priceText', formData.priceText.trim());
        productData.append('currency', formData.currency);
        
        if (formData.img) {
            productData.append('img', formData.img);
        }
        
        const validCharacteristics = characteristics.filter(char => 
            char.title.trim() && char.description.trim()
        );
        
        if (validCharacteristics.length > 0) {
            productData.append('info', JSON.stringify(validCharacteristics));
        }

        await onUpdate(product.id, productData);
    };

    const handleClose = () => {
        setError('');
        setFormData({
            name: '',
            price: '',
            description: '',
            city: '',
            typeId: '',
            img: null,
            priceType: 'fixed',
            priceText: ''
        });
        setCharacteristics([{ title: '', description: '' }]);
        setImagePreview('');
        onHide();
    };

    const renderPriceField = () => {
        switch (formData.priceType) {
            case 'fixed':
                return (
                    <Form.Group className="mb-3">
                        <Form.Label>Цена (BYN) <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            disabled={loading}
                        />
                    </Form.Group>
                );
            case 'negotiable':
                return (
                    <div className="mb-3">
                        <p className="text-muted">Цена: <strong>Договорная</strong></p>
                    </div>
                );
            case 'custom':
                return (
                    <Form.Group className="mb-3">
                        <Form.Label>Текст цены <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="priceText"
                            value={formData.priceText}
                            onChange={handleInputChange}
                            placeholder="Например: Бесплатно, Обмен, Цена по запросу..."
                            disabled={loading}
                        />
                    </Form.Group>
                );
            default:
                return null;
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="edit-product-modal">
            <Modal.Header closeButton>
                <Modal.Title>Редактирование товара</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <strong>Ошибка:</strong> {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <div className="form-section">
                                <h3 className="section-title">Основная информация</h3>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Название товара <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Введите название товара"
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Тип цены</Form.Label>
                                    <div>
                                        <Form.Check
                                            inline
                                            type="radio"
                                            label="Фиксированная"
                                            name="priceType"
                                            value="fixed"
                                            checked={formData.priceType === 'fixed'}
                                            onChange={(e) => handlePriceTypeChange('fixed')}
                                            disabled={loading}
                                        />
                                        <Form.Check
                                            inline
                                            type="radio"
                                            label="Договорная"
                                            name="priceType"
                                            value="negotiable"
                                            checked={formData.priceType === 'negotiable'}
                                            onChange={(e) => handlePriceTypeChange('negotiable')}
                                            disabled={loading}
                                        />
                                        <Form.Check
                                            inline
                                            type="radio"
                                            label="Другое"
                                            name="priceType"
                                            value="custom"
                                            checked={formData.priceType === 'custom'}
                                            onChange={(e) => handlePriceTypeChange('custom')}
                                            disabled={loading}
                                        />
                                    </div>
                                </Form.Group>

                                {renderPriceField()}

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Город <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="">Выберите город</option>
                                        {cities.map(city => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Тип товара <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="typeId"
                                        value={formData.typeId}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                    >
                                        <option value="">Выберите тип</option>
                                        {types.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Описание</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Опишите ваш товар..."
                                        disabled={loading}
                                    />
                                </Form.Group>
                            </div>
                        </Col>

                        <Col md={6}>
                            <div className="form-section">
                                <h3 className="section-title">Изображение</h3>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        Изображение товара
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                    />
                                    <Form.Text className="text-muted">
                                        Максимальный размер: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
                                    </Form.Text>
                                </Form.Group>

                                {(imagePreview || formData.img) && (
                                    <div className="image-preview">
                                        <p>Предпросмотр:</p>
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="preview-image"
                                        />
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>

                    <div className="form-section">
                        <div className="section-header">
                            <h3 className="section-title">Характеристики</h3>
                            <Button 
                                type="button" 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={addCharacteristic}
                                disabled={loading}
                            >
                                + Добавить характеристику
                            </Button>
                        </div>
                        
                        {characteristics.map((char, index) => (
                            <Row key={index} className="characteristic-row">
                                <Col md={5}>
                                    <Form.Group className="mb-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Название характеристики"
                                            value={char.title}
                                            onChange={(e) => handleCharacteristicChange(index, 'title', e.target.value)}
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group className="mb-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Значение"
                                            value={char.description}
                                            onChange={(e) => handleCharacteristicChange(index, 'description', e.target.value)}
                                            disabled={loading}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Button
                                        type="button"
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => removeCharacteristic(index)}
                                        disabled={characteristics.length === 1 || loading}
                                    >
                                        ×
                                    </Button>
                                </Col>
                            </Row>
                        ))}
                    </div>

                    <div className="form-actions">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Отмена
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={loading}
                            className="submit-button"
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                        className="me-2"
                                    />
                                    Сохраняем...
                                </>
                            ) : (
                                'Сохранить изменения'
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditProductModal;