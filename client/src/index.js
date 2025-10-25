import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UserStore from "./store/UserStore";
import DeviceStore from "./store/DeviceStore";
import { createContext } from 'react';
import { productStore } from './store/ProductStore'; // Импортируйте экземпляр

export const Context = createContext(null);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Context.Provider value={{
    user: new UserStore(),
    device: new DeviceStore(),
    product: productStore // Используйте экземпляр напрямую
  }}>
    <App />
  </Context.Provider>
);