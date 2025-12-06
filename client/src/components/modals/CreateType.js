import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from "react-bootstrap";

const CreateType = ({ show, onHide, onCreate, loading }) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!value.trim()) {
            setError('Название типа обязательно');
            return;
        }

        if (value.length < 2) {
            setError('Название типа должно содержать минимум 2 символа');
            return;
        }

        setError('');
        onCreate(value);
        setValue(''); // Очищаем поле после создания
    };

    const handleClose = () => {
        setValue('');
        setError('');
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Добавить новый тип
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder={"Введите название типа"}
                        onKeyPress={e => {
                            if (e.key === 'Enter') {
                                handleCreate();
                            }
                        }}
                    />
                    {error && (
                        <div className="text-danger mt-2 small">{error}</div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={handleClose}>
                    Отмена
                </Button>
                <Button 
                    variant="outline-success" 
                    onClick={handleCreate}
                    disabled={loading || !value.trim()}
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-2" />
                            Добавление...
                        </>
                    ) : (
                        'Добавить'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateType;