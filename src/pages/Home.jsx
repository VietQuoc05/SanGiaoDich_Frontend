import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
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
        const res = await fetch("http://localhost:8080/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.text(); // backend đang trả string

        // data = "Hello admin" → lấy username
        const name = data.replace("Hello ", "");
        setUsername(name);

      } catch (err) {
        console.error(err);
        setError("Không thể lấy thông tin user");
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // loading
  if (loading) {
    return <p>Loading...</p>;
  }

  // error
  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome {username} 🚀</h1>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "red",
          color: "#fff",
          border: "none",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Home;