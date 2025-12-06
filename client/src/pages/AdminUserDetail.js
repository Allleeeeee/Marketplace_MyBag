import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
    Container, 
    Card, 
    Row, 
    Col, 
    Badge, 
    Button, 
    Table, 
    Modal, 
    Alert, 
    Spinner,
    Tabs,
    Tab,
    ListGroup
} from 'react-bootstrap';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { 
    getUserInfo, 
    blockUser, 
    unblockUser
} from '../http/userAPI';
import { 
    getSellerByUserId
} from '../http/sellerAPI';
import { 
    getReviewsBySeller,
    getReviewsByUser,
    deleteReview
} from '../http/reviewAPI'; // Нужно создать этот файл
import { deleteProduct } from '../http/productAPI';

const AdminUserDetail = observer(() => {
    const { id } = useParams();
    const history = useHistory();
    const { product, user } = useContext(Context);
    const [userData, setUserData] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Состояния для отзывов
    const [reviewsAsSeller, setReviewsAsSeller] = useState([]); // Отзывы, написанные продавцу
    const [reviewsAsUser, setReviewsAsUser] = useState([]); // Отзывы, написанные пользователем
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        loadUserData();
    }, [id]);

    const loadUserData = async () => {
        setLoading(true);
        try {
            console.log('🔄 Loading user data for ID:', id);
            
            // Загружаем информацию о пользователе
            const userInfo = await getUserInfo(id);
            console.log('✅ User data loaded:', userInfo);
            setUserData(userInfo);

            // Пробуем получить продавца по user_id
            try {
                console.log('🏪 Trying to get seller for user ID:', id);
                const sellerInfo = await getSellerByUserId(id);
                console.log('✅ Seller data loaded:', sellerInfo);
                setSeller(sellerInfo);

                // Загружаем товары продавца
                if (sellerInfo && sellerInfo.id) {
                    console.log('📦 Loading products for seller ID:', sellerInfo.id);
                    await product.fetchSellerProducts(sellerInfo.id);
                    console.log('✅ Products loaded via store, count:', product.sellerProducts.length);
                    
                    // Загружаем отзывы о продавце
                    await loadSellerReviews(sellerInfo.id);
                }

                // Загружаем отзывы, написанные пользователем
                await loadUserReviews(id);

            } catch (sellerError) {
                console.log('ℹ️ User is not a seller or seller not found:', sellerError.message);
                setSeller(null);
            }

        } catch (e) {
            console.error('❌ Error loading user data:', e);
            console.error('Error response:', e.response);
            setError('Ошибка при загрузке данных пользователя: ' + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    const loadSellerReviews = async (sellerId) => {
        setReviewsLoading(true);
        try {
            console.log('📝 Loading reviews for seller ID:', sellerId);
            const reviews = await getReviewsBySeller(sellerId);
            console.log('✅ Seller reviews loaded:', reviews.length);
            setReviewsAsSeller(reviews);
        } catch (e) {
            console.error('❌ Error loading seller reviews:', e);
            setError('Ошибка при загрузке отзывов о продавце: ' + (e.response?.data?.message || e.message));
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadUserReviews = async (userId) => {
        setReviewsLoading(true);
        try {
            console.log('📝 Loading reviews by user ID:', userId);
            const reviews = await getReviewsByUser(userId);
            console.log('✅ User reviews loaded:', reviews.length);
            setReviewsAsUser(reviews);
        } catch (e) {
            console.error('❌ Error loading user reviews:', e);
            setError('Ошибка при загрузке отзывов пользователя: ' + (e.response?.data?.message || e.message));
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId, reviewType) => {
        setActionLoading(true);
        try {
            await deleteReview(reviewId);
            setSuccess('Отзыв успешно удален');
            
            // Перезагружаем отзывы
            if (seller) {
                await loadSellerReviews(seller.id);
            }
            await loadUserReviews(id);
            
        } catch (e) {
            setError('Ошибка при удалении отзыва: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleBlockUser = async () => {
        setActionLoading(true);
        try {
            await blockUser(id);
            setSuccess('Пользователь заблокирован');
            loadUserData(); // Обновляем данные
        } catch (e) {
            setError('Ошибка при блокировке: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblockUser = async () => {
        setActionLoading(true);
        try {
            await unblockUser(id);
            setSuccess('Пользователь разблокирован');
            loadUserData(); // Обновляем данные
        } catch (e) {
            setError('Ошибка при разблокировке: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        setActionLoading(true);
        try {
            await deleteProduct(productId);
            setSuccess('Товар успешно удален');
            // Перезагружаем товары через store
            if (seller) {
                await product.fetchSellerProducts(seller.id);
            }
        } catch (e) {
            setError('Ошибка при удалении товара: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    // Функция для отображения звезд рейтинга
    const renderRatingStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return (
            <Container className="mt-4 d-flex justify-content-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </Container>
        );
    }

    if (!userData) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">Пользователь не найден</Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            {/* Заголовок и кнопки управления */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Пользователь: {userData.username}</h2>
                    <div className="d-flex gap-2 mt-2">
                        <Badge bg={userData.role === 'ADMIN' ? 'danger' : 'primary'}>
                            {userData.role}
                        </Badge>
                        <Badge bg={userData.is_blocked ? 'danger' : 'success'}>
                            {userData.is_blocked ? 'Заблокирован' : 'Активен'}
                        </Badge>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <Button 
                        variant="outline-secondary"
                        onClick={() => history.push('/admin/users')}
                    >
                        ← Назад к списку
                    </Button>
                    {!userData.is_blocked ? (
                        <Button 
                            variant="outline-warning"
                            onClick={handleBlockUser}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Spinner size="sm" /> : '🔒 Заблокировать'}
                        </Button>
                    ) : (
                        <Button 
                            variant="outline-success"
                            onClick={handleUnblockUser}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <Spinner size="sm" /> : '🔓 Разблокировать'}
                        </Button>
                    )}
                </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Tabs defaultActiveKey="userInfo" className="mb-3">
                {/* Вкладка с информацией о пользователе */}
                <Tab eventKey="userInfo" title="Информация о пользователе">
                    <Row>
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Основная информация</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item>
                                            <strong>ID:</strong> {userData.id}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Имя пользователя:</strong> {userData.username}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Email:</strong> {userData.email}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Телефон:</strong> {userData.phone || 'Не указан'}
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <strong>Дата регистрации:</strong> {new Date(userData.createdAt).toLocaleString('ru-RU')}
                                        </ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">Информация о продавце</h5>
                                </Card.Header>
                                <Card.Body>
                                    {seller ? (
                                        <ListGroup variant="flush">
                                            <ListGroup.Item>
                                                <strong>ID продавца:</strong> {seller.id}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>ID пользователя:</strong> {seller.user_id}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Название магазина:</strong> {seller.name}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Рейтинг:</strong> {seller.rating ? `${seller.rating.toFixed(1)} ${renderRatingStars(Math.round(seller.rating))}` : 'Нет рейтинга'}
                                            </ListGroup.Item>
                                            <ListGroup.Item>
                                                <strong>Описание:</strong> {seller.description || 'Нет описания'}
                                            </ListGroup.Item>
                                            {seller.img && seller.img !== 'default_image_url.jpg' && (
                                                <ListGroup.Item>
                                                    <strong>Изображение:</strong><br />
                                                    <img 
                                                        src={seller.img} 
                                                        alt="Seller" 
                                                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted">Пользователь не является продавцом</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                {/* Вкладка с товарами */}
                <Tab eventKey="products" title={`Товары (${product.sellerProducts?.length || 0})`}>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Товары продавца</h5>
                            {seller && (
                                <div>
                                    <small className="text-muted">Seller ID: {seller.id}</small>
                                    <br />
                                    <small className="text-muted">User ID: {seller.user_id}</small>
                                </div>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {product.sellerProducts && product.sellerProducts.length > 0 ? (
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Название</th>
                                            <th>Город</th>
                                            <th>Цена</th>
                                            <th>Тип цены</th>
                                            <th>Статус</th>
                                            <th>Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.sellerProducts.map(productItem => (
                                            <tr key={productItem.id}>
                                                <td>{productItem.id}</td>
                                                <td>{productItem.name}</td>
                                                <td>{productItem.city}</td>
                                                <td>{productItem.price || productItem.price_text}</td>
                                                <td>
                                                    <Badge bg="info">
                                                        {productItem.price_type === 'fixed' ? 'Фиксированная' : 'Договорная'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={productItem.is_hidden ? 'secondary' : 'success'}>
                                                        {productItem.is_hidden ? 'Скрыт' : 'Активен'}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteProduct(productItem.id)}
                                                        disabled={actionLoading}
                                                    >
                                                        🗑️ Удалить
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <p>У пользователя нет товаров</p>
                                    {seller && (
                                        <div>
                                            <small>Продавец существует, но товары не найдены</small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Вкладка с отзывами */}
                <Tab eventKey="reviews" title={`Отзывы (${reviewsAsSeller.length + reviewsAsUser.length})`}>
                    <Row>
                        {/* Отзывы о продавце */}
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">
                                        Отзывы о продавце 
                                        <Badge bg="primary" className="ms-2">
                                            {reviewsAsSeller.length}
                                        </Badge>
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {reviewsLoading ? (
                                        <div className="text-center">
                                            <Spinner size="sm" />
                                            <span className="ms-2">Загрузка отзывов...</span>
                                        </div>
                                    ) : reviewsAsSeller.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {reviewsAsSeller.map(review => (
                                                <ListGroup.Item key={review.id} className="border-bottom">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <strong>Отзыв #{review.id}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                От пользователя: {review.user_id}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteReview(review.id, 'seller')}
                                                            disabled={actionLoading}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Рейтинг:</strong> {renderRatingStars(review.rating)}
                                                        <span className="ms-2">({review.rating}/5)</span>
                                                    </div>
                                                    {review.comment && (
                                                        <div className="mb-2">
                                                            <strong>Комментарий:</strong>
                                                            <p className="mb-1">{review.comment}</p>
                                                        </div>
                                                    )}
                                                    {review.image_url && (
                                                        <div className="mb-2">
                                                            <strong>Изображение:</strong>
                                                            <br />
                                                            <img 
                                                                src={review.image_url} 
                                                                alt="Review" 
                                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <small className="text-muted">
                                                        Дата: {new Date(review.createdAt).toLocaleString('ru-RU')}
                                                    </small>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted text-center">
                                            {seller ? 'Нет отзывов о продавце' : 'Пользователь не является продавцом'}
                                        </p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Отзывы, написанные пользователем */}
                        <Col md={6}>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">
                                        Отзывы пользователя
                                        <Badge bg="info" className="ms-2">
                                            {reviewsAsUser.length}
                                        </Badge>
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    {reviewsLoading ? (
                                        <div className="text-center">
                                            <Spinner size="sm" />
                                            <span className="ms-2">Загрузка отзывов...</span>
                                        </div>
                                    ) : reviewsAsUser.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {reviewsAsUser.map(review => (
                                                <ListGroup.Item key={review.id} className="border-bottom">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <strong>Отзыв #{review.id}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                О продавце: {review.seller_id}
                                                            </small>
                                                        </div>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteReview(review.id, 'user')}
                                                            disabled={actionLoading}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Рейтинг:</strong> {renderRatingStars(review.rating)}
                                                        <span className="ms-2">({review.rating}/5)</span>
                                                    </div>
                                                    {review.comment && (
                                                        <div className="mb-2">
                                                            <strong>Комментарий:</strong>
                                                            <p className="mb-1">{review.comment}</p>
                                                        </div>
                                                    )}
                                                    {review.image_url && (
                                                        <div className="mb-2">
                                                            <strong>Изображение:</strong>
                                                            <br />
                                                            <img 
                                                                src={review.image_url} 
                                                                alt="Review" 
                                                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <small className="text-muted">
                                                        Дата: {new Date(review.createdAt).toLocaleString('ru-RU')}
                                                    </small>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <p className="text-muted text-center">Пользователь не оставлял отзывов</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
});

export default AdminUserDetail;