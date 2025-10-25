// routes.js
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ProductPage from "./pages/ProductPage";
import Shop from "./pages/Shop";
import UserProfile from './pages/UserInfo';
import AddProductPage from "./pages/AddProductPage";
import FavoritesPage from "./pages/FavoritesPage"; // Импортируем страницу избранного
import { ADMIN_ROUTE,ADD_PRODUCT_ROUTE, SHOP_ROUTE, PROFILE_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, PRODUCT_ROUTE, FAVORITES_ROUTE } from "./utils/const";

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin
    },
    { 
        path: PROFILE_ROUTE, 
        Component: UserProfile 
    },
    {
        path: ADD_PRODUCT_ROUTE,
        Component: AddProductPage
    },
    {
        path: FAVORITES_ROUTE, // Добавляем маршрут для избранного
        Component: FavoritesPage
    }
];

export const publicRoutes = [
    {
        path: SHOP_ROUTE,
        Component: Shop
    },
    {
        path: LOGIN_ROUTE,
        Component: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        Component: Auth
    },
    {
        path: PRODUCT_ROUTE + '/:id',
        Component: ProductPage
    }
];