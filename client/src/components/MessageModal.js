import React, { useState, useEffect, useContext, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Context } from '../index';
import { Modal, Button, Form, Badge, Spinner, Alert } from 'react-bootstrap';
import { getChats, getMessages, sendMessage, markAsRead } from '../http/messageAPI';
import '../css/components/MessageModal.css';

const MessageModal = observer(() => {
    const { message, user } = useContext(Context);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatsLoading, setChatsLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Функция для обновления чатов в фоне
    const refreshChatsInBackground = async () => {
        if (!user.user?.id || !user.isAuth) return;
        
        try {
            const chats = await getChats(user.user.id);
            message.setChats(chats);
            
            const totalUnread = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
            message.setUnreadCount(totalUnread);
            
            // Если открыт активный чат, обновляем сообщения
            if (message.activeChat && message.activeChat.otherUser) {
                const currentMessages = await getMessages(
                    user.user.id, 
                    message.activeChat.otherUser.id, 
                    message.activeChat.product?.id || null
                );
                message.setMessages(currentMessages);
            }
        } catch (error) {
            console.error('Фоновая загрузка чатов:', error);
        }
    };

    useEffect(() => {
        if (message.isModalOpen && user.isAuth) {
            loadChats();
            
            // Запускаем polling каждые 5 секунд когда модалка открыта
            pollingIntervalRef.current = setInterval(refreshChatsInBackground, 5000);
        } else {
            message.setActiveChat(null);
            message.setMessages([]);
            setNewMessage('');
            setError('');
            
            // Очищаем интервал когда модалка закрыта
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        }
        
        // Очистка при размонтировании
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [message.isModalOpen, user.isAuth]);

    // Polling для уведомлений в навбаре (даже когда модалка закрыта)
    useEffect(() => {
        if (user.isAuth) {
            const notificationInterval = setInterval(async () => {
                if (!user.user?.id) return;
                
                try {
                    const chats = await getChats(user.user.id);
                    const totalUnread = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
                    message.setUnreadCount(totalUnread);
                } catch (error) {
                    console.error('Ошибка фонового обновления уведомлений:', error);
                }
            }, 10000); // Каждые 10 секунд

            return () => clearInterval(notificationInterval);
        }
    }, [user.isAuth, user.user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [message.messages]);

    const loadChats = async () => {
        if (!user.user?.id) {
            setError('Пользователь не авторизован');
            return;
        }

        setChatsLoading(true);
        setError('');
        try {
            const chats = await getChats(user.user.id);
            message.setChats(chats);
            
            const totalUnread = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
            message.setUnreadCount(totalUnread);
        } catch (error) {
            console.error('Ошибка при загрузке чатов:', error);
            setError('Не удалось загрузить чаты');
        } finally {
            setChatsLoading(false);
        }
    };

    const loadMessages = async (otherUser, product = null) => {
        if (!user.user?.id || !otherUser?.id) {
            setError('Неверные данные пользователя');
            return;
        }

        setMessagesLoading(true);
        setError('');
        try {
            const messages = await getMessages(user.user.id, otherUser.id, product?.id || null);
            message.setMessages(messages);
            
            // Помечаем сообщения как прочитанные
            const hasUnread = messages.some(msg => !msg.is_read && msg.receiver_id === user.user.id);
            if (hasUnread) {
                await markAsRead({
                    userId: user.user.id,
                    otherUserId: otherUser.id,
                    productId: product?.id || null
                });
                // Обновляем чаты чтобы убрать непрочитанные
                await loadChats();
            }
        } catch (error) {
            console.error('Ошибка при загрузке сообщений:', error);
            setError('Не удалось загрузить сообщения');
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleChatSelect = async (chat) => {
        if (!chat.otherUser || !chat.otherUser.id) {
            setError('Не удалось открыть чат');
            return;
        }

        try {
            message.setActiveChat({
                otherUser: chat.otherUser,
                product: chat.product || null
            });
            await loadMessages(chat.otherUser, chat.product);
        } catch (error) {
            console.error('Ошибка при выборе чата:', error);
            setError('Не удалось открыть чат');
        }
    };

    const sendMessageHandler = async () => {
        if (!newMessage.trim() || !message.activeChat) return;
        if (!user.user?.id || !message.activeChat.otherUser?.id) {
            setError('Неверные данные для отправки сообщения');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const messageData = {
                sender_id: user.user.id,
                receiver_id: message.activeChat.otherUser.id,
                product_id: message.activeChat.product?.id || null,
                message: newMessage.trim()
            };

            const sentMessage = await sendMessage(messageData);
            
            // Добавляем сообщение в список
            message.addMessage(sentMessage);
            setNewMessage('');
            
            // Немедленно обновляем чаты
            await loadChats();
            
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            setError(`Не удалось отправить сообщение: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageHandler();
        }
    };

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('ru-RU', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            return '';
        }
    };

    const formatChatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays === 1) {
                return 'Вчера';
            } else if (diffDays < 7) {
                return `${diffDays} дн. назад`;
            } else {
                return date.toLocaleDateString('ru-RU');
            }
        } catch (error) {
            return '';
        }
    };

    const truncateMessage = (text, maxLength = 25) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const isChatActive = (chat) => {
        if (!message.activeChat || !chat.otherUser) return false;
        return message.activeChat.otherUser.id === chat.otherUser.id &&
               message.activeChat.product?.id === chat.product?.id;
    };

    const getRoleText = (role) => {
        switch (role) {
            case 'SELLER': return 'Продавец';
            case 'ADMIN': return 'Администратор';
            default: return 'Покупатель';
        }
    };

    return (
        <Modal 
            show={message.isModalOpen} 
            onHide={() => message.setIsModalOpen(false)}
            size="lg"
            centered
            className="message-modal"
        >
            <Modal.Header className="message-modal-header">
    <div className="header-content">
        <div className="title-section">
            <h4 className="modal-title">
                💬 Мои сообщения
                {message.unreadCount > 0 && (
                    <Badge bg="danger" className="unread-badge">
                        {message.unreadCount}
                    </Badge>
                )}
            </h4>
        </div>
        <div className="header-actions">
            <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={loadChats}
                disabled={chatsLoading}
                className="refresh-btn"
                title="Обновить чаты"
            >
                {chatsLoading ? (
                    <Spinner 
                        size="sm" 
                        animation="border" 
                        style={{ width: '16px', height: '16px' }}
                    />
                ) : (
                    '⟳'
                )}
            </Button>
            <Button 
                variant="outline-secondary" 
                onClick={() => message.setIsModalOpen(false)}
                className="close-btn"
                title="Закрыть"
            >
                ×
            </Button>
        </div>
    </div>
</Modal.Header>
            
            <Modal.Body className="message-modal-body p-0">
                {error && (
                    <Alert variant="danger" className="error-alert m-3 mb-0">
                        {error}
                    </Alert>
                )}
                
                <div className="messages-container">
                    {/* Список чатов */}
                    <div className="chats-sidebar">
                        <div className="chats-header">
                            <h5>Чаты</h5>
                            <small className="text-muted">Автообновление: 5с</small>
                        </div>
                        
                        {chatsLoading ? (
                            <div className="loading-state">
                                <Spinner variant="primary" />
                                <span>Загрузка чатов...</span>
                            </div>
                        ) : (
                            <div className="chats-list">
                                {message.chats && message.chats.length > 0 ? (
                                    message.chats.map((chat, index) => (
                                        <div
                                            key={`${chat.otherUser?.id}-${chat.product?.id || 'no-product'}-${index}`}
                                            className={`chat-item ${isChatActive(chat) ? 'active' : ''}`}
                                            onClick={() => handleChatSelect(chat)}
                                        >
                                            <div className="chat-avatar">
                                                {chat.otherUser?.username?.charAt(0)?.toUpperCase() || '?'}
                                                {chat.unreadCount > 0 && (
                                                    <div className="unread-dot"></div>
                                                )}
                                            </div>
                                            <div className="chat-content">
                                                <div className="chat-header">
                                                    <span className="chat-name">
                                                        {chat.otherUser?.username || 'Неизвестный'}
                                                    </span>
                                                    {chat.unreadCount > 0 && (
                                                        <Badge bg="danger" className="unread-count">
                                                            {chat.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="chat-preview">
                                                    <span className="last-message">
                                                        {truncateMessage(chat.lastMessage)}
                                                        {chat.unreadCount > 0 && (
                                                            <span className="new-message-indicator"> ✨</span>
                                                        )}
                                                    </span>
                                                    <span className="chat-time">
                                                        {formatChatTime(chat.lastMessageTime)}
                                                    </span>
                                                </div>
                                                {chat.product && (
                                                    <div className="product-badge">
                                                        {chat.product.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">💬</div>
                                        <p>Нет активных чатов</p>
                                        <small>Начните общение с продавцом</small>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Область сообщений */}
                    <div className="messages-area">
                        {message.activeChat && message.activeChat.otherUser ? (
                            <>
                                <div className="chat-header-area">
                                    <div className="active-chat-info">
                                        <div className="user-avatar">
                                            {message.activeChat.otherUser.username?.charAt(0)?.toUpperCase() || '?'}
                                        </div>
                                        <div className="user-info">
                                            <h5>{message.activeChat.otherUser.username || 'Неизвестный'}</h5>
                                            <span className="user-role">
                                                {getRoleText(message.activeChat.otherUser.role)}
                                            </span>
                                        </div>
                                    </div>
                                    {message.activeChat.product && (
                                        <Badge bg="secondary" className="product-tag">
                                            {message.activeChat.product.name}
                                        </Badge>
                                    )}
                                </div>
                                
                                <div className="messages-list">
                                    {messagesLoading ? (
                                        <div className="loading-state">
                                            <Spinner variant="primary" />
                                            <span>Загрузка сообщений...</span>
                                        </div>
                                    ) : message.messages && message.messages.length > 0 ? (
                                        <>
                                            {message.messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`message ${msg.sender_id === user.user.id ? 'sent' : 'received'} ${
                                                        !msg.is_read && msg.receiver_id === user.user.id ? 'unread' : ''
                                                    }`}
                                                >
                                                    <div className="message-bubble">
                                                        <div className="message-text">
                                                            {msg.message}
                                                            {!msg.is_read && msg.receiver_id === user.user.id && (
                                                                <span className="new-indicator"> ●</span>
                                                            )}
                                                        </div>
                                                        <div className="message-time">
                                                            {formatMessageTime(msg.timestamp)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    ) : (
                                        <div className="empty-messages">
                                            <div className="empty-icon">💭</div>
                                            <p>Нет сообщений</p>
                                            <small>Начните диалог первым</small>
                                        </div>
                                    )}
                                </div>

                                <div className="message-input-area">
                                    <Form.Group className="message-form">
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Введите сообщение..."
                                            disabled={loading || messagesLoading}
                                            maxLength={1000}
                                            className="message-textarea"
                                        />
                                        <div className="input-footer">
                                            <span className="char-count">
                                                {newMessage.length}/1000
                                            </span>
                                            <Button
                                                variant="primary"
                                                onClick={sendMessageHandler}
                                                disabled={!newMessage.trim() || loading || messagesLoading}
                                                className="send-btn"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Отправка...
                                                    </>
                                                ) : (
                                                    'Отправить'
                                                )}
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </div>
                            </>
                        ) : (
                            <div className="select-chat-prompt">
                                <div className="prompt-content">
                                    <div className="prompt-icon">💬</div>
                                    <h5>Выберите чат</h5>
                                    <p>Выберите чат для начала общения или начните новый диалог</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
});

export default MessageModal;