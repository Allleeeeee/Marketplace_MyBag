import React, {useContext, useState} from 'react';
import { Container, Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import {observer} from "mobx-react-lite";
import Button from "react-bootstrap/Button";
import { NavLink, useHistory } from 'react-router-dom';
import { LOGIN_ROUTE, REGISTRATION_ROUTE, SHOP_ROUTE } from "../utils/const";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import { login, registration } from "../http/userAPI";
import {Context} from "../index";
const Auth = () => {
    const location = useLocation()
     const history = useHistory()
    const isLogin = location.pathname === LOGIN_ROUTE
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {user} = useContext(Context)

    console.log(location)

    const click = async () =>{
        try{
        let data;
        if(isLogin){
            data=await login(email,password);
        }else{
             data = await registration(email,password);
        }
         user.setUser(data.user); 
       user.setIsAuth(true)
       history.push(SHOP_ROUTE)
    }catch(e){
        alert(e.response.data.message)
    }
    }

    return (
        <Container
            className="d-flex justify-content-center align-items-center"
            style={{ height: window.innerHeight - 54 }}
        >
            <Card style={{ width: 668 }} className="p-5">
                <h2 className="m-auto">{isLogin ? "Авторизация":"Регистрация"}</h2>
                <Form className="d-flex flex-column">
                    <Form.Control
                        className="mt-3"
                        placeholder="Введите ваш email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Form.Control
                        className="mt-3"
                        placeholder="Введите ваш пароль..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                    />
                    <div className="d-flex flex-column">
                        {isLogin ? 
                        <div className="mt-3">
                            Нет аккаунта? <NavLink to={REGISTRATION_ROUTE}>Зарегистрируйся!</NavLink>
                        </div>
                        :
                          <div className="mt-3">
                            Есть аккаунт? <NavLink to={LOGIN_ROUTE}>Войдите!</NavLink>
                        </div>
                        }
                        <Button
                            className="mt-3 align-self-end"
                            variant="outline-success"
                            onClick={click}
                        >
                         {isLogin ? "Войти":"Регистрация"}  
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default observer(Auth);