import React, { useContext } from "react";
import {Switch, Route, Redirect} from 'react-router-dom'
import { authRoutes } from "../routes";
import { publicRoutes } from "../routes";
import { SHOP_ROUTE } from "../utils/const";
import { Context } from "../index.js";
import {observer} from "mobx-react-lite";
import SellersPage from "../pages/SellersPage";
import SellerDetailPage from "../pages/SellerDetailPage";

const AppRouter =()=> {
    const { user } = useContext(Context); 
    console.log(user)
    return (
    <Switch >
      {user.isAuth && authRoutes.map (({path,Component})=>
    <Route key={path} path={path} component={Component} exact/>)}

     {publicRoutes.map (({path,Component})=>
    <Route key={path} path={path} component={Component} exact/>)}
     
     {/* Добавляем маршруты для продавцов */}
     <Route path="/sellers" component={SellersPage} exact/>
     <Route path="/seller/:id" component={SellerDetailPage} exact/>
     
    <Redirect to={SHOP_ROUTE}/> 
    </Switch>
  );
}

export default observer(AppRouter);