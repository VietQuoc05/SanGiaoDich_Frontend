import { useNavigate } from "react-router-dom";
import RoleDashboard from "./RoleDashboard";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{
        maxWidth: "720px",
        margin: "0 auto 24px",
        paddingTop: "40px",
        paddingX: "40px"
      }}>
        <button
          onClick={() => navigate("/supplier-requests")}
          style={{
            width: "100%",
            padding: "16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.target.style.background = "#1d4ed8"}
          onMouseLeave={(e) => e.target.style.background = "#2563eb"}
        >
          📋 Xem Supplier Requests
        </button>
      </div>

      <RoleDashboard
        title="Admin Dashboard"
        themeColor="#dc2626"
        description="Trang này dành cho ROLE_ADMIN. Chỉ tài khoản admin mới được vào."
      />
    </div>
  );
}

export default AdminDashboard;