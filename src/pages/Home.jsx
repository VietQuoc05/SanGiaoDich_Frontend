import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredRole } from "../utils/auth";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const res = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.text();
        const name = data.replace("Hello ", "");
        setUsername(name);
      } catch (err) {
        console.error(err);
        setError("Không thể lấy thông tin user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleRequestSupplier = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setRequestLoading(true);
      setRequestMessage("");

      const res = await fetch("/api/supplier/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to request supplier");
      }

      setRequestMessage("Yêu cầu trở thành supplier đã được gửi. Vui lòng chờ phê duyệt.");
    } catch (err) {
      console.error(err);
      setRequestMessage("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  const role = getStoredRole();

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: "#0f172a"
    }}>
      <div style={{ maxWidth: "720px" }}>
        <p style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: "999px",
          background: "#2563eb",
          color: "#fff",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}>
          {role || "User"}
        </p>

        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
          Welcome {username || "User"} 🚀
        </h1>

        <p style={{ fontSize: "16px", color: "#475569", maxWidth: "560px", marginBottom: "32px" }}>
          Trang này dành cho ROLE_USER. Sau khi đăng nhập, hệ thống sẽ tự chuyển về đây nếu tài khoản của bạn là user.
        </p>

        {requestMessage && (
          <p style={{
            color: requestMessage.includes("không thể") ? "#dc2626" : "#16a34a",
            background: requestMessage.includes("không thể") ? "#fee2e2" : "#dcfce7",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            {requestMessage}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={handleRequestSupplier}
            disabled={requestLoading}
            style={{
              padding: "12px 18px",
              background: requestLoading ? "#94a3b8" : "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: requestLoading ? "not-allowed" : "pointer"
            }}
          >
            {requestLoading ? "Đang gửi..." : "📝 Request to become a supplier"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 18px",
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;