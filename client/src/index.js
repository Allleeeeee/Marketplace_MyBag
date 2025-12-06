import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserStore from "./store/UserStore";
import DeviceStore from "./store/DeviceStore";
import MessageStore from "./store/MessageStore"; // Добавьте этот импорт
import { createContext } from 'react';
import { productStore } from './store/ProductStore'; 

export const Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Context.Provider value={{
    user: new UserStore(),
    device: new DeviceStore(),
    product: productStore,
    message: new MessageStore() // Добавьте эту строку
  }}>
    <App />
  </Context.Provider>
);