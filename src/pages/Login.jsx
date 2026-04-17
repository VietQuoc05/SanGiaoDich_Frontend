import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRedirectPathForRole, resolveAuthData } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // validate
    if (!form.username || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : await res.text();

      const { token, role } = resolveAuthData(data);

      if (!token) {
        throw new Error("Missing token in login response");
      }

      localStorage.setItem("token", token);
      if (role) {
        localStorage.setItem("role", role);
      } else {
        localStorage.removeItem("role");
      }

      const redirectPath = getRedirectPathForRole(role) || "/home";

      navigate(redirectPath, { replace: true });

    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#f5f5f5"
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center" }}>Login</h2>

        {/* error */}
        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            {error}
          </p>
        )}

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ width: "100%", padding: "8px", marginTop: "10px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "15px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px",
            background: "transparent",
            color: "#007bff",
            border: "1px solid #007bff",
            cursor: "pointer"
          }}
        >
          Create account
        </button>
      </form>
    </div>
  );
}

export default Login;