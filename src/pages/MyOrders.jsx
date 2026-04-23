import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStoredRole } from "../utils/auth";

function MyOrders() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  const formatCurrency = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return "Liên hệ";
    }

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(number);
  };

  const extractOrders = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.orders)) {
      return payload.orders;
    }

    if (Array.isArray(payload?.content)) {
      return payload.content;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  };

  const fetchMyOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get("/orders/my");
      setOrders(extractOrders(res?.data));
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchMyOrders();
  }, [fetchMyOrders, navigate]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => {
      const amount = Number(order?.totalAmount ?? order?.totalPrice ?? order?.amount ?? 0);
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return { totalOrders, totalAmount };
  }, [orders]);

  const role = getStoredRole();

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        color: "#0f172a"
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/home")}
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
          ← Quay lại Home
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "18px"
          }}
        >
          <div>
            <p
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#2563eb",
                color: "#fff",
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "12px"
              }}
            >
              {role || "User"}
            </p>
            <h1 style={{ fontSize: "34px", margin: 0 }}>My Orders</h1>
            <p style={{ color: "#475569", marginTop: "8px" }}>Theo dõi trạng thái các đơn hàng của bạn.</p>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "16px 18px",
              minWidth: "220px",
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)"
            }}
          >
            <p style={{ margin: "0 0 6px", color: "#64748b" }}>Tổng đơn</p>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>{summary.totalOrders}</p>
            <p style={{ margin: "10px 0 0", color: "#64748b" }}>Tổng chi tiêu</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{formatCurrency(summary.totalAmount)}</p>
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px"
            }}
          >
            {error}
          </p>
        )}

        {!error && orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 24px",
              background: "#fff",
              borderRadius: "14px",
              color: "#64748b",
              border: "1px solid #e2e8f0"
            }}
          >
            Bạn chưa có đơn hàng nào.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {orders.map((order, index) => {
              const orderId = order?.id ?? order?.orderId ?? index + 1;
              const address = order?.address ?? order?.shippingAddress ?? "Chưa có địa chỉ";
              const method = order?.method ?? order?.paymentMethod ?? "COD";
              const status = order?.status ?? order?.orderStatus ?? "PENDING";
              const total = Number(order?.totalAmount ?? order?.totalPrice ?? order?.amount ?? 0);
              const createdAt = order?.createdAt ?? order?.orderDate ?? order?.createdDate;

              return (
                <article
                  key={orderId}
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: "20px" }}>Đơn hàng #{orderId}</h2>
                      <p style={{ margin: "6px 0 0", color: "#475569" }}>Địa chỉ: {address}</p>
                      {createdAt && (
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>Ngày tạo: {new Date(createdAt).toLocaleString("vi-VN")}</p>
                      )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{formatCurrency(total)}</p>
                      <p style={{ margin: "6px 0 0", color: "#64748b" }}>Thanh toán: {method}</p>
                      <p style={{ margin: "6px 0 0", color: "#2563eb", fontWeight: 600 }}>Trạng thái: {status}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
