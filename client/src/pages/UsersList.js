import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import { Container, Table, Button, Modal, Alert, Card, Spinner, Badge } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { getAllUsers, blockUser, unblockUser } from '../http/userAPI';

const UsersList = observer(() => {
    const { user } = useContext(Context);
    const history = useHistory();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersData = await getAllUsers();
            console.log('📋 Loaded users:', usersData);
            setUsers(usersData);
            setError('');
        } catch (e) {
            setError('Ошибка при загрузке пользователей: ' + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async () => {
        setActionLoading(true);
        try {
            await blockUser(selectedUser.id);
            setShowBlockModal(false);
            setSuccess('Пользователь успешно заблокирован');
            fetchUsers();
        } catch (e) {
            setError('Ошибка при блокировке пользователя: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async () => {
        setActionLoading(true);
        try {
            await unblockUser(selectedUser.id);
            setShowUnblockModal(false);
            setSuccess('Пользователь успешно разблокирован');
            fetchUsers();
        } catch (e) {
            setError('Ошибка при разблокировке пользователя: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const openBlockModal = (user) => {
        setSelectedUser(user);
        setShowBlockModal(true);
        setError('');
        setSuccess('');
    };

    const openUnblockModal = (user) => {
        setSelectedUser(user);
        setShowUnblockModal(true);
        setError('');
        setSuccess('');
    };

    const viewUserDetails = (user) => {
        console.log('🔍 Viewing user details:', user);
        history.push(`/admin/user/${user.id}`);
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

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header>
                    <h2 className="mb-0">Управление пользователями</h2>
                    <p className="text-muted mb-0">Всего пользователей: {users.length}</p>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Имя пользователя</th>
                                <th>Email</th>
                                <th>Телефон</th>
                                <th>Роль</th>
                                <th>Статус</th>
                                <th>Продавец</th>
                                <th>Дата регистрации</th>
                                <th width="200">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(userItem => (
                                <tr key={userItem.id}>
                                    <td>{userItem.id}</td>
                                    <td>{userItem.username}</td>
                                    <td>{userItem.email}</td>
                                    <td>{userItem.phone || 'Не указан'}</td>
                                    <td>
                                        <Badge bg={userItem.role === 'ADMIN' ? 'danger' : 'primary'}>
                                            {userItem.role}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={userItem.is_blocked ? 'danger' : 'success'}>
                                            {userItem.is_blocked ? 'Заблокирован' : 'Активен'}
                                        </Badge>
                                    </td>
                                    <td>
                                        {userItem.Seller ? (
                                            <Badge bg="info">Есть (ID: {userItem.Seller.id})</Badge>
                                        ) : (
                                            <Badge bg="secondary">Нет</Badge>
                                        )}
                                    </td>
                                    <td>{new Date(userItem.createdAt).toLocaleDateString('ru-RU')}</td>
                                    <td>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <Button 
                                                variant="outline-info" 
                                                size="sm"
                                                onClick={() => viewUserDetails(userItem)}
                                                title="Просмотреть детальную информацию"
                                            >
                                                👁️ Просмотр
                                            </Button>
                                            {!userItem.is_blocked ? (
                                                <Button 
                                                    variant="outline-warning" 
                                                    size="sm"
                                                    onClick={() => openBlockModal(userItem)}
                                                    disabled={actionLoading || 
                                                             userItem.id === user.user.id || 
                                                             userItem.role === 'ADMIN'}
                                                    title={userItem.role === 'ADMIN' ? 'Нельзя заблокировать администратора' : 
                                                           userItem.id === user.user.id ? 'Нельзя заблокировать себя' : ''}
                                                >
                                                    🔒 Блокировать
                                                </Button>
                                            ) : (
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm"
                                                    onClick={() => openUnblockModal(userItem)}
                                                    disabled={actionLoading}
                                                >
                                                    🔓 Разблокировать
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {users.length === 0 && !loading && (
                        <div className="text-center text-muted py-4">
                            Пользователи не найдены
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showBlockModal} onHide={() => !actionLoading && setShowBlockModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение блокировки</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите заблокировать пользователя <strong>{selectedUser?.username}</strong>?
                    {selectedUser?.Seller && (
                        <div className="mt-2">
                            <Alert variant="warning" className="mb-0">
                                <small>
                                    Все товары продавца будут скрыты из публичного доступа.
                                </small>
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBlockModal(false)} disabled={actionLoading}>
                        Отмена
                    </Button>
                    <Button variant="warning" onClick={handleBlock} disabled={actionLoading}>
                        {actionLoading ? <Spinner size="sm" /> : 'Заблокировать'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showUnblockModal} onHide={() => !actionLoading && setShowUnblockModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение разблокировки</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите разблокировать пользователя <strong>{selectedUser?.username}</strong>?
                    {selectedUser?.Seller && (
                        <div className="mt-2">
                            <Alert variant="info" className="mb-0">
                                <small>
                                    Все товары продавца будут восстановлены.
                                </small>
                            </Alert>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUnblockModal(false)} disabled={actionLoading}>
                        Отмена
                    </Button>
                    <Button variant="success" onClick={handleUnblock} disabled={actionLoading}>
                        {actionLoading ? <Spinner size="sm" /> : 'Разблокировать'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
});

export default UsersList;