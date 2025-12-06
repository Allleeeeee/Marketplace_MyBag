import React, { useState, useEffect } from "react";
import { Button, Container, Table, Modal, Alert, Spinner, Card, Badge } from "react-bootstrap";
import CreateType from "../components/modals/CreateType";
import { createType, fetchTypes, deleteType } from "../http/deviceAPI";

const Admin = () => {
    const [typeVisible, setTypeVisible] = useState(false);
    const [types, setTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, type: null });

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        setLoading(true);
        try {
            const typesData = await fetchTypes();
            setTypes(typesData);
            setError('');
        } catch (e) {
            setError('Ошибка при загрузке типов: ' + (e.response?.data?.message || e.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateType = async (name) => {
        setActionLoading(true);
        try {
            console.log('Creating type with name:', name);
            await createType(name);
            setTypeVisible(false);
            setSuccess('Тип успешно создан');
            loadTypes(); // Перезагружаем список
        } catch (e) {
            console.error('Create type error:', e);
            setError('Ошибка при создании типа: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteType = async () => {
        if (!deleteModal.type) return;
        
        setActionLoading(true);
        try {
            await deleteType(deleteModal.type.id);
            setDeleteModal({ show: false, type: null });
            setSuccess('Тип и все связанные товары успешно удалены');
            loadTypes(); // Перезагружаем список
        } catch (e) {
            setError('Ошибка при удалении типа: ' + (e.response?.data?.message || e.message));
        } finally {
            setActionLoading(false);
        }
    };

    const openDeleteModal = (type) => {
        setDeleteModal({ show: true, type });
        setError('');
        setSuccess('');
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, type: null });
    };

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="mb-0">Управление типами товаров</h2>
                        <p className="text-muted mb-0">Всего типов: {types.length}</p>
                    </div>
                    <Button
                        variant="success"
                        onClick={() => setTypeVisible(true)}
                        disabled={loading}
                    >
                        ➕ Добавить тип
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    {loading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Table striped bordered hover responsive>
                            <thead className="table-dark">
                                <tr>
                                    <th width="60">ID</th>
                                    <th>Название типа</th>
                                    <th width="150">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.map(type => (
                                    <tr key={type.id}>
                                        <td>
                                            <Badge bg="secondary">{type.id}</Badge>
                                        </td>
                                        <td>
                                            <strong>{type.name}</strong>
                                        </td>
                                        <td>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => openDeleteModal(type)}
                                                disabled={actionLoading}
                                                title="Удалить тип и все связанные товары"
                                            >
                                                🗑️ Удалить
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}

                    {types.length === 0 && !loading && (
                        <div className="text-center text-muted py-4">
                            Типы не найдены. Добавьте первый тип.
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Модальное окно создания типа */}
            <CreateType 
                show={typeVisible} 
                onHide={() => setTypeVisible(false)}
                onCreate={handleCreateType}
                loading={actionLoading}
            />

            {/* Модальное окно удаления типа */}
            <Modal show={deleteModal.show} onHide={closeDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="alert alert-danger">
                        <strong>Внимание! Это действие необратимо!</strong>
                    </div>
                    <p>Вы уверены, что хотите удалить тип <strong>"{deleteModal.type?.name}"</strong>?</p>
                    <p>При удалении типа также будут <strong>безвозвратно удалены</strong>:</p>
                    <ul>
                        <li>Все товары, относящиеся к этому типу</li>
                        <li>Все изображения и информация о этих товарах</li>
                        <li>Все связи и упоминания этих товаров в системе</li>
                    </ul>
                    <p className="text-danger mb-0">
                        <strong>Это действие нельзя отменить!</strong>
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={closeDeleteModal}
                        disabled={actionLoading}
                    >
                        Отмена
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={handleDeleteType}
                        disabled={actionLoading}
                    >
                        {actionLoading ? (
                            <>
                                <Spinner 
                                    as="span" 
                                    animation="border" 
                                    size="sm" 
                                    role="status" 
                                    className="me-2"
                                />
                                Удаление...
                            </>
                        ) : (
                            'Удалить тип и все товары'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Admin;