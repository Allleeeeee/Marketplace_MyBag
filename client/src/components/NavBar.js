import React, { useContext } from "react";
import { Context } from "../index";
import { useHistory } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Nav, Navbar, Container, Button, Badge } from 'react-bootstrap';
import { LOGIN_ROUTE, ADD_PRODUCT_ROUTE, FAVORITES_ROUTE, PROFILE_ROUTE, SHOP_ROUTE } from "../utils/const"; 
import logo from '../assets/logo.png'; 
import favorite from '../assets/Favorite.png'; 
import prof from '../assets/Profile.png'; 
import CityDisplay from './CityDisplay'; 
import '../styles.css';

const NavBar = () => {
    const { user, message } = useContext(Context); // Добавлено user и message из контекста
    const history = useHistory();

    const logOut = () => {
        user.setUser({});
        user.setIsAuth(false);
        localStorage.removeItem('token');
        message.setIsModalOpen(false); // Закрываем модалку при выходе
    };

    return (
        <Navbar collapseOnSelect expand="lg" className="navbar">
            <Container>
                <img 
                    src={logo} 
                    alt="Logo" 
                />
                <Navbar.Brand 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => history.push(SHOP_ROUTE)}
                >
                    My Bag
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        {user.isAuth && user.user.role === 'ADMIN' && (
                            <>
                                <Button 
                                    variant="outline-dark" 
                                    onClick={() => history.push('/admin')}
                                    className="nav-button me-2"
                                >
                                    ➕ Добавить тип
                                </Button>
                                <Button 
                                    variant="outline-dark" 
                                    onClick={() => history.push('/admin/users')}
                                    className="nav-button me-2"
                                >
                                    👥 Пользователи
                                </Button>
                            </>
                        )}
                        {user.isAuth && user.user.role === 'USER' && (
                            <CityDisplay />
                        )}
                    </Nav>
                    {user.isAuth ? (
                        <Nav>
                            {user.user.role === 'USER' && (
                                <>
                                    <Button 
                                        variant="outline-dark" 
                                        onClick={() => history.push(FAVORITES_ROUTE)}
                                        className="nav-button"
                                    >
                                        <img 
                                            src={favorite} 
                                            alt="Favorites"
                                            className="navbarimg"
                                        />
                                        <span className="nav-text">Избранное</span>
                                    </Button>
                                    <Button 
                                        variant="outline-dark" 
                                        onClick={() => history.push(PROFILE_ROUTE)} 
                                        className="nav-button"
                                    >
                                        <img 
                                            src={prof} 
                                            alt="Profile"
                                            className="navbarimg"
                                        />
                                        <span className="nav-text">Профиль</span>
                                    </Button>
                                    <Button 
                                        variant="outline-dark" 
                                        onClick={() => history.push(ADD_PRODUCT_ROUTE)}
                                        className="nav-button"
                                    >
                                        <span className="nav-text">Добавить товар</span>
                                    </Button>
                                </>
                            )}
                            {/* Кнопка сообщений для всех авторизованных пользователей */}
                            <Button 
                                variant="outline-dark" 
                                onClick={() => message.setIsModalOpen(true)}
                                className="nav-button position-relative"
                            >
                                💬 {/* Временная замена иконки */}
                                <span className="nav-text">Сообщения</span>
                                {message.unreadCount > 0 && (
                                    <Badge 
                                        bg="danger" 
                                        className="position-absolute top-0 start-100 translate-middle"
                                        style={{ fontSize: '0.6rem' }}
                                    >
                                        {message.unreadCount}
                                    </Badge>
                                )}
                            </Button>
                            <Button 
                                variant="outline-dark" 
                                onClick={() => logOut()}
                                className="nav-button"
                            >
                                Выйти
                            </Button>
                        </Nav>
                    ) : (
                        <Nav>
                            <Button className="nav-button"  variant="outline-dark" onClick={() => history.push(LOGIN_ROUTE)}>
                                Авторизоваться
                            </Button>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default observer(NavBar);