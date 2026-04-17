import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.username || !form.password || !form.confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password
        })
      });

      if (!res.ok) {
        throw new Error("Register failed");
      }

      setSuccess("Đăng ký thành công. Vui lòng đăng nhập.");
      setForm({
        username: "",
        password: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Không thể tạo tài khoản. Tên đăng nhập có thể đã tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
    }}>
      <form
        onSubmit={handleSignup}
        style={{
          background: "#fff",
          padding: "32px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "8px" }}>Sign up</h2>
        <p style={{ textAlign: "center", marginTop: 0, color: "#64748b" }}>
          Tạo tài khoản mới để đăng nhập
        </p>

        {error && (
          <p style={{ color: "#dc2626", textAlign: "center" }}>{error}</p>
        )}

        {success && (
          <p style={{ color: "#16a34a", textAlign: "center" }}>{success}</p>
        )}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          autoComplete="username"
          style={{ width: "100%", padding: "10px", marginTop: "12px", boxSizing: "border-box" }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          style={{ width: "100%", padding: "10px", marginTop: "12px", boxSizing: "border-box" }}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          style={{ width: "100%", padding: "10px", marginTop: "12px", boxSizing: "border-box" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "16px",
            background: loading ? "#94a3b8" : "#0f172a",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Đang tạo tài khoản..." : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            background: "transparent",
            color: "#0f172a",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          Back to login
        </button>
      </form>
    </div>
  );
}

export default Signup;