import { useNavigate } from "react-router-dom";
import RoleDashboard from "./RoleDashboard";

function SupplierDashboard() {
  const navigate = useNavigate();

  return (
    <RoleDashboard
      title="Supplier Dashboard"
      themeColor="#16a34a"
      description="Trang này dành cho ROLE_SUPPLIER. Chỉ tài khoản supplier mới được vào."
      actions={(
        <button
          onClick={() => navigate("/supplier/products")}
          style={{
            padding: "12px 18px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          Quản lý sản phẩm
        </button>
      )}
    />
  );
}

export default SupplierDashboard;