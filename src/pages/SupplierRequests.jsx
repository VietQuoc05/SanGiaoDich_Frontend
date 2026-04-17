import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SupplierRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const resolveUsername = (request) => {
    return (
      request.username ||
      request.user?.username ||
      request.requestedBy?.username ||
      request.account?.username ||
      request.userName ||
      request.name ||
      request.user?.name ||
      request.requestedBy?.name ||
      "N/A"
    );
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/supplier/requests", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: "approving" }));

      const res = await fetch(`/api/supplier/approve/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to approve request");
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(err);
      setError("Không thể phê duyệt yêu cầu");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: "rejecting" }));

      const res = await fetch(`/api/supplier/reject/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to reject request");
      }

      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(err);
      setError("Không thể từ chối yêu cầu");
    } finally {
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "40px",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: "#0f172a"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/admin")}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            background: "#64748b",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ← Quay lại Admin
        </button>

        <h1 style={{ fontSize: "32px", marginBottom: "12px" }}>
          Quản lý yêu cầu Supplier
        </h1>

        {error && (
          <p style={{
            color: "#dc2626",
            background: "#fee2e2",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            {error}
          </p>
        )}

        {requests.length === 0 ? (
          <p style={{
            textAlign: "center",
            padding: "40px",
            background: "#fff",
            borderRadius: "12px",
            color: "#64748b"
          }}>
            Không có yêu cầu nào để xử lý
          </p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {requests
              .filter((req) => {
                const status = (req.status || "").toUpperCase();
                return status !== "APPROVED" && status !== "REJECTED" && status !== "APPROVE" && status !== "REJECT";
              })
              .map((request) => (
              <div
                key={request.id}
                style={{
                  background: "#fff",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ marginBottom: "8px", fontSize: "18px" }}>
                    ID: {request.id}
                  </h3>
                  <p style={{ color: "#64748b", margin: "4px 0" }}>
                    <strong>Username:</strong> {resolveUsername(request)}
                  </p>
                  <p style={{ color: "#64748b", margin: "4px 0" }}>
                    <strong>Status:</strong> {request.status || "PENDING"}
                  </p>
                  {request.createdAt && (
                    <p style={{ color: "#64748b", margin: "4px 0" }}>
                      <strong>Ngày tạo:</strong> {new Date(request.createdAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={actionLoading[request.id]}
                    style={{
                      padding: "10px 16px",
                      background: actionLoading[request.id] === "approving" ? "#94a3b8" : "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: actionLoading[request.id] ? "not-allowed" : "pointer"
                    }}
                  >
                    {actionLoading[request.id] === "approving" ? "Đang xử lý..." : "Phê duyệt"}
                  </button>

                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={actionLoading[request.id]}
                    style={{
                      padding: "10px 16px",
                      background: actionLoading[request.id] === "rejecting" ? "#94a3b8" : "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: actionLoading[request.id] ? "not-allowed" : "pointer"
                    }}
                  >
                    {actionLoading[request.id] === "rejecting" ? "Đang xử lý..." : "Từ chối"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierRequests;
