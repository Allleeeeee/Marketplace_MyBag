// pages/AddProductPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Context } from '../index';
import { createProduct } from '../http/productAPI';
import { checkOrCreateSeller } from '../http/sellerAPI';
import { getTypes, getBelarusCities } from '../http/productAPI';
import { observer } from 'mobx-react-lite';
import '../css/pages/AddProductPage.css';

const AddProductPage = observer(() => {
    const { user } = useContext(Context);
    const history = useHistory();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [sellerChecked, setSellerChecked] = useState(false);
    const [types, setTypes] = useState([]);
    const [cities, setCities] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [citiesLoading, setCitiesLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        city: '',
        typeId: '',
        img: null,
        priceType: 'fixed',
        priceText: '',
        currency: 'USD'
    });
    
    const [characteristics, setCharacteristics] = useState([
        { title: '', description: '' }
    ]);

    // Загружаем типы товаров и города
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
            } finally {
                setTypesLoading(false);
                setCitiesLoading(false);
            }
        };

        loadData();
    }, []);

    // Проверяем/создаем продавца при загрузке компонента
    useEffect(() => {
        const initializeSeller = async () => {
            if (user.isAuth) {
                try {
                    setLoading(true);
                    await checkOrCreateSeller(user.user.id, `${user.user.username}'s Shop`);
                    setSellerChecked(true);
                } catch (err) {
                    console.error('Error initializing seller:', err);
                    setError('Ошибка инициализации профиля продавца. Пожалуйста, обновите страницу.');
                } finally {
                    setLoading(false);
                }
            }
        };

        initializeSeller();
    }, [user.isAuth, user.user.id, user.user.username]);

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
            currency: priceType === 'fixed' ? prev.currency : 'USD'
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
        
        if (!formData.img) {
            return 'Изображение товара обязательно';
        }
        
        if (!formData.typeId) {
            return 'Выберите тип товара';
        }
        
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user.isAuth) {
            setError('Для добавления товара необходимо авторизоваться');
            return;
        }

        if (!sellerChecked) {
            setError('Профиль продавца еще не готов. Пожалуйста, подождите...');
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const productData = new FormData();
            productData.append('name', formData.name.trim());
            productData.append('price', formData.price);
            productData.append('sellerId', user.user.id);
            productData.append('typeId', formData.typeId);
            productData.append('city', formData.city.trim());
            productData.append('description', formData.description.trim());
            productData.append('priceType', formData.priceType);
            productData.append('priceText', formData.priceText.trim());
            productData.append('currency', formData.currency);
            productData.append('img', formData.img);
            
            const validCharacteristics = characteristics.filter(char => 
                char.title.trim() && char.description.trim()
            );
            
            if (validCharacteristics.length > 0) {
                productData.append('info', JSON.stringify(validCharacteristics));
            }

            await createProduct(productData);
            
            setSuccess('Товар успешно добавлен! Перенаправляем в магазин...');
            
            setFormData({
                name: '',
                price: '',
                description: '',
                city: '',
                typeId: '',
                img: null,
                priceType: 'fixed',
                priceText: '',
                currency: 'USD'
            });
            setCharacteristics([{ title: '', description: '' }]);
            document.getElementById('productImage').value = '';
            
            setTimeout(() => {
                history.push('/');
            }, 2000);
            
        } catch (err) {
            console.error('Error adding product:', err);
            
            if (err.response?.data?.message) {
                setError(`Ошибка: ${err.response.data.message}`);
            } else if (err.message?.includes('seller')) {
                setError('Ошибка: Проблема с профилем продавца. Пожалуйста, обновите страницу и попробуйте снова.');
            } else if (err.message?.includes('type')) {
                setError('Ошибка: Проблема с типом товара. Пожалуйста, выберите другой тип.');
            } else {
                setError('Ошибка при добавлении товара. Проверьте все поля и попробуйте еще раз.');
            }
        } finally {
            setLoading(false);
        }
    };

    const renderPriceField = () => {
        switch (formData.priceType) {
            case 'fixed':
                return (
                    <Row>
                        <Col md={8}>
                            <Form.Group className="mb-3">
                                <Form.Label>Цена <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    disabled={loading || !sellerChecked}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Валюта</Form.Label>
                                <Form.Select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    disabled={loading || !sellerChecked}
                                >
                                    <option value="USD">$ USD</option>
                                    <option value="EUR">€ EUR</option>
                                    <option value="BYN">Br BYN</option>
                                    <option value="RUB">₽ RUB</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
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
                            disabled={loading || !sellerChecked}
                        />
                    </Form.Group>
                );
            default:
                return null;
        }
    };

    if (!user.isAuth) {
        return (
            <div className="add-product-container">
                <Container>
                    <Alert variant="warning" className="text-center">
                        <h4>Требуется авторизация</h4>
                        <p>Для добавления товаров необходимо войти в систему</p>
                        <Button variant="primary" onClick={() => history.push('/login')}>
                            Войти
                        </Button>
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className="add-product-container">
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <div className="page-header">
                            <h1 className="page-title">Добавить новый товар</h1>
                            <p className="page-subtitle">Заполните информацию о вашем товаре</p>
                        </div>

                        {!sellerChecked && (
                            <Alert variant="info" className="text-center">
                                <Spinner size="sm" className="me-2" />
                                Подготавливаем ваш профиль продавца...
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="danger">
                                <strong>Ошибка:</strong> {error}
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert variant="success">
                                <strong>Успех!</strong> {success}
                            </Alert>
                        )}

                        <Card className="product-form-card">
                            <Card.Body>
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
                                                        disabled={loading || !sellerChecked}
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
                                                            disabled={loading || !sellerChecked}
                                                        />
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            label="Договорная"
                                                            name="priceType"
                                                            value="negotiable"
                                                            checked={formData.priceType === 'negotiable'}
                                                            onChange={(e) => handlePriceTypeChange('negotiable')}
                                                            disabled={loading || !sellerChecked}
                                                        />
                                                        <Form.Check
                                                            inline
                                                            type="radio"
                                                            label="Другое"
                                                            name="priceType"
                                                            value="custom"
                                                            checked={formData.priceType === 'custom'}
                                                            onChange={(e) => handlePriceTypeChange('custom')}
                                                            disabled={loading || !sellerChecked}
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
                                                        disabled={loading || !sellerChecked || citiesLoading}
                                                    >
                                                        <option value="">Выберите город</option>
                                                        {cities.map(city => (
                                                            <option key={city} value={city}>
                                                                {city}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    {citiesLoading && (
                                                        <Form.Text className="text-muted">
                                                            Загрузка городов...
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>

                                                <Form.Group className="mb-3">
                                                    <Form.Label>
                                                        Тип товара <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Select
                                                        name="typeId"
                                                        value={formData.typeId}
                                                        onChange={handleInputChange}
                                                        disabled={loading || !sellerChecked || typesLoading}
                                                    >
                                                        <option value="">Выберите тип</option>
                                                        {types.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                    {typesLoading && (
                                                        <Form.Text className="text-muted">
                                                            Загрузка типов...
                                                        </Form.Text>
                                                    )}
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
                                                        disabled={loading || !sellerChecked}
                                                    />
                                                </Form.Group>
                                            </div>
                                        </Col>

                                        <Col md={6}>
                                            <div className="form-section">
                                                <h3 className="section-title">Изображение</h3>
                                                
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        Изображение товара <span className="text-danger">*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        id="productImage"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        disabled={loading || !sellerChecked}
                                                    />
                                                    <Form.Text className="text-muted">
                                                        Максимальный размер: 5MB. Поддерживаемые форматы: JPG, PNG, GIF
                                                    </Form.Text>
                                                </Form.Group>

                                                {formData.img && (
                                                    <div className="image-preview">
                                                        <p>Предпросмотр:</p>
                                                        <img 
                                                            src={URL.createObjectURL(formData.img)} 
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
                                                disabled={loading || !sellerChecked}
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
                                                            disabled={loading || !sellerChecked}
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
                                                            disabled={loading || !sellerChecked}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Button
                                                        type="button"
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeCharacteristic(index)}
                                                        disabled={characteristics.length === 1 || loading || !sellerChecked}
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
                                            onClick={() => history.goBack()}
                                            disabled={loading}
                                        >
                                            Отмена
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            disabled={loading || !sellerChecked}
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
                                                    Добавляем...
                                                </>
                                            ) : (
                                                'Добавить товар'
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
});

export default AddProductPage;