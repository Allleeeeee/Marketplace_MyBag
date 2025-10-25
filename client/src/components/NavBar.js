// components/NavBar.js
import React, { useContext } from "react";
import { Context } from "../index";
import { useHistory } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Nav, Navbar, Container, Button } from 'react-bootstrap';
import { LOGIN_ROUTE,ADD_PRODUCT_ROUTE, ADMIN_ROUTE, FAVORITES_ROUTE, PROFILE_ROUTE } from "../utils/const"; // Добавьте FAVORITES_ROUTE
import logo from '../assets/logo.png'; 
import favorite from '../assets/Favorite.png'; 
import CityDisplay from './CityDisplay'; 
import prof from '../assets/Profile.png'; 
import '../styles.css';

const NavBar = () => {
    const { user } = useContext(Context);
    const history = useHistory();

    const logOut = () => {
        user.setUser({});
        user.setIsAuth(false);
    };

    return (
        <Navbar collapseOnSelect expand="lg" className="navbar">
            <Container>
                <img 
                    src={logo} 
                    alt="Logo" 
                />
                <Navbar.Brand href="/">My Bag</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <CityDisplay /> 
                    </Nav>
                    {user.isAuth ? (
                        <Nav>
                            <Button 
                                variant="outline-dark" 
                                onClick={() => history.push(FAVORITES_ROUTE)} // Используем history.push
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
                                onClick={() => history.push(PROFILE_ROUTE)} // Используем history.push
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
                                onClick={() => history.push(ADMIN_ROUTE)}
                                className="nav-button"
                            >
                                Админ панель
                            </Button>
                            <Button 
    variant="outline-dark" 
    onClick={() => history.push(ADD_PRODUCT_ROUTE)}
    className="nav-button"
>
    <span className="nav-text">Добавить товар</span>
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
                            <Button variant="outline-dark" onClick={() => history.push(LOGIN_ROUTE)}>
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