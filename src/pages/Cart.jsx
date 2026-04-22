import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { getStoredRole } from "../utils/auth";

function Cart() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartData, setCartData] = useState([]);

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

  const resolveImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") {
      return "";
    }

    try {
      return encodeURI(rawUrl);
    } catch {
      return rawUrl;
    }
  };

  const extractCartItems = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.content)) {
      return payload.content;
    }

    if (Array.isArray(payload?.items)) {
      return payload.items;
    }

    if (Array.isArray(payload?.cartItems)) {
      return payload.cartItems;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    return [];
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get("/cart");
      const payload = res?.data;
      setCartData(extractCartItems(payload));
    } catch (err) {
      console.error(err);
      setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchCart();
  }, [navigate]);

  const cartSummary = useMemo(() => {
    const totalItems = cartData.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? item?.qty ?? 1);
      return sum + (Number.isFinite(quantity) ? quantity : 1);
    }, 0);

    const totalPrice = cartData.reduce((sum, item) => {
      const quantity = Number(item?.quantity ?? item?.qty ?? 1);
      const price = Number(item?.price ?? item?.product?.price ?? item?.product?.sellingPrice ?? 0);
      const safeQuantity = Number.isFinite(quantity) ? quantity : 1;
      const safePrice = Number.isFinite(price) ? price : 0;
      return sum + safePrice * safeQuantity;
    }, 0);

    return { totalItems, totalPrice };
  }, [cartData]);

  const role = getStoredRole();

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Đang tải giỏ hàng...</p>
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
            <h1 style={{ fontSize: "34px", margin: 0 }}>Giỏ hàng</h1>
            <p style={{ color: "#475569", marginTop: "8px" }}>Xem các sản phẩm bạn đã thêm vào giỏ hàng.</p>
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
            <p style={{ margin: "0 0 6px", color: "#64748b" }}>Tổng sản phẩm</p>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>{cartSummary.totalItems}</p>
            <p style={{ margin: "10px 0 0", color: "#64748b" }}>Tổng tiền</p>
            <p style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>{formatCurrency(cartSummary.totalPrice)}</p>
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

        {!error && cartData.length === 0 ? (
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
            Giỏ hàng của bạn đang trống.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {cartData.map((item, index) => {
              const product = item?.product ?? item;
              const itemId = item?.id ?? product?.id ?? index;
              const name = product?.name ?? product?.productName ?? item?.name ?? `Sản phẩm #${index + 1}`;
              const description = product?.description ?? item?.description ?? "Chưa có mô tả";
              const quantity = Number(item?.quantity ?? item?.qty ?? 1);
              const price = Number(item?.price ?? product?.price ?? product?.sellingPrice ?? 0);
              const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : Array.isArray(item?.imageUrls) ? item.imageUrls : [];
              const imageUrl = imageUrls.length > 0 ? resolveImageUrl(imageUrls[0]) : "";

              return (
                <article
                  key={itemId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: "16px",
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    ) : null}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <div>
                        <h2 style={{ margin: 0, fontSize: "20px" }}>{name}</h2>
                        <p style={{ margin: "6px 0 0", color: "#475569" }}>{description}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{formatCurrency(price)}</p>
                        <p style={{ margin: "6px 0 0", color: "#64748b" }}>x {Number.isFinite(quantity) ? quantity : 1}</p>
                      </div>
                    </div>

                    <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                      Thành tiền: {formatCurrency((Number.isFinite(price) ? price : 0) * (Number.isFinite(quantity) ? quantity : 1))}
                    </p>
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

export default Cart;
