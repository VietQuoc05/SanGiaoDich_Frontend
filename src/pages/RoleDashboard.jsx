import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredRole } from "../utils/auth";

function RoleDashboard({ title, themeColor, description, actions = null }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          background: themeColor,
          color: "#fff",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase"
        }}>
          {role || title}
        </p>

        <h1 style={{ fontSize: "42px", marginBottom: "12px" }}>
          {title}, {username || "User"}
        </h1>

        <p style={{ fontSize: "16px", color: "#475569", maxWidth: "560px" }}>
          {description}
        </p>

        {actions && (
          <div style={{ marginTop: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {actions}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: "24px",
            padding: "12px 18px",
            background: "#0f172a",
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
  );
}

export default RoleDashboard;