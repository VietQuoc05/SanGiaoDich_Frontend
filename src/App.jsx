import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierProducts from "./pages/SupplierProducts";
import SupplierRequests from "./pages/SupplierRequests";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["ROLE_USER"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SUPPLIER"]}>
              <SupplierDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier/products"
          element={
            <ProtectedRoute allowedRoles={["ROLE_SUPPLIER"]}>
              <SupplierProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/supplier-requests"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <SupplierRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;