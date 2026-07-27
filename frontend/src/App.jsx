import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastHost } from "./components/Toast";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import ProductsPage from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import Account from "./pages/Account";

import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import CategoriesAdmin from "./pages/admin/CategoriesAdmin";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";

// Layout riêng cho các trang khách hàng: có Header (menu, tìm kiếm, giỏ hàng)
// và Footer (liên hệ, đăng ký khuyến mãi). KHÔNG dùng cho trang quản trị.
function CustomerLayout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        {/* ---- Trang khách hàng: bọc trong CustomerLayout (Header + Footer) ---- */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gioi-thieu" element={<About />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-success/:id"
            element={
              <PrivateRoute>
                <OrderSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/tai-khoan"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Home />} />
        </Route>

        {/* ---- Dashboard quản trị: layout riêng (sidebar), KHÔNG có Header/Footer khách hàng ---- */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="orders/paid" element={<OrdersAdmin paidOnly />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="reviews" element={<ReviewsAdmin />} />
        </Route>
      </Routes>
      <ToastHost />
    </>
  );
}
