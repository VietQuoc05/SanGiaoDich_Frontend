import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function resolveImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  try {
    const parsed = new URL(rawUrl);

    // Keep port/path from backend URL, but replace localhost host for non-local access.
    if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      parsed.hostname = window.location.hostname;
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

function SupplierProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: "",
    files: []
  });

  const fetchMyProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axiosClient.get("/products/my");
      const payload = res?.data;

      if (Array.isArray(payload)) {
        setProducts(payload);
        return;
      }

      if (Array.isArray(payload?.content)) {
        setProducts(payload.content);
        return;
      }

      setProducts([]);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách sản phẩm của bạn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [navigate]);

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      description: "",
      price: "",
      files: []
    });
    setCreateError("");
  };

  const openCreateModal = () => {
    resetCreateForm();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (createLoading) {
      return;
    }

    setShowCreateModal(false);
    setCreateError("");
  };

  const handleCreateInputChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setCreateForm((prev) => ({
      ...prev,
      files: selectedFiles
    }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setCreateError("");

    const name = createForm.name.trim();
    const description = createForm.description.trim();
    const price = Number(createForm.price);

    if (!name || !description || Number.isNaN(price)) {
      setCreateError("Vui lòng nhập đầy đủ tên, mô tả và giá hợp lệ");
      return;
    }

    if (createForm.files.length === 0) {
      setCreateError("Vui lòng chọn ít nhất 1 hình ảnh");
      return;
    }

    try {
      setCreateLoading(true);

      const formData = new FormData();
      createForm.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axiosClient.post("/products/create", formData, {
        params: {
          name,
          description,
          price
        },
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const createdProduct = response?.data;
      if (createdProduct && typeof createdProduct === "object") {
        setProducts((prev) => [createdProduct, ...prev]);
      } else {
        await fetchMyProducts();
      }

      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      console.error(err);
      setCreateError("Tạo sản phẩm thất bại, vui lòng thử lại");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Đang tải sản phẩm...</p>
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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <button
          onClick={() => navigate("/supplier")}
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
          ← Quay lại Supplier Dashboard
        </button>

        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>Sản phẩm của tôi</h1>
        <p style={{ color: "#475569", marginBottom: "20px" }}>
          Danh sách các sản phẩm mà tài khoản supplier hiện tại đã tạo.
        </p>

        <button
          onClick={openCreateModal}
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}
        >
          + Tạo sản phẩm
        </button>

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

        {products.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "40px",
              background: "#fff",
              borderRadius: "12px",
              color: "#64748b"
            }}
          >
            Bạn chưa tạo sản phẩm nào.
          </p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {products.map((product, index) => {
              const productId = product.id || product.productId || index;
              const productName = product.name || product.productName || "(Chưa có tên sản phẩm)";
              const price = product.price ?? product.unitPrice;
              const quantity = product.quantity ?? product.stock;
              const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls : [];

              return (
                <div
                  key={productId}
                  style={{
                    background: "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <h3 style={{ marginBottom: "8px", fontSize: "20px" }}>{productName}</h3>

                  <p style={{ color: "#334155", margin: "6px 0" }}>
                    <strong>ID:</strong> {String(productId)}
                  </p>

                  {typeof price !== "undefined" && (
                    <p style={{ color: "#334155", margin: "6px 0" }}>
                      <strong>Giá:</strong> {price}
                    </p>
                  )}

                  {typeof quantity !== "undefined" && (
                    <p style={{ color: "#334155", margin: "6px 0" }}>
                      <strong>Số lượng:</strong> {quantity}
                    </p>
                  )}

                  {product.description && (
                    <p style={{ color: "#475569", margin: "8px 0" }}>
                      <strong>Mô tả:</strong> {product.description}
                    </p>
                  )}

                  {imageUrls.length > 0 && (
                    <div
                      style={{
                        marginTop: "12px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "10px"
                      }}
                    >
                      {imageUrls.map((imageUrl, imageIndex) => (
                        <img
                          key={`${productId}-${imageIndex}`}
                          src={resolveImageUrl(imageUrl)}
                          alt={`${productName} - ảnh ${imageIndex + 1}`}
                          style={{
                            width: "100%",
                            height: "140px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc"
                          }}
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}

                  {product.createdAt && (
                    <p style={{ color: "#64748b", margin: "6px 0" }}>
                      <strong>Ngày tạo:</strong> {new Date(product.createdAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000
          }}
          onClick={closeCreateModal}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              background: "#fff",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.2)"
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", marginBottom: "14px" }}>Tạo sản phẩm mới</h2>

            {createError && (
              <p
                style={{
                  color: "#dc2626",
                  background: "#fee2e2",
                  padding: "10px",
                  borderRadius: "8px",
                  marginBottom: "14px"
                }}
              >
                {createError}
              </p>
            )}

            <form onSubmit={handleCreateProduct}>
              <label style={{ display: "block", marginBottom: "10px", color: "#334155", fontWeight: "600" }}>
                Tên sản phẩm
              </label>
              <input
                type="text"
                name="name"
                value={createForm.name}
                onChange={handleCreateInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  marginBottom: "14px"
                }}
                placeholder="Ví dụ: Ghế Sofa"
              />

              <label style={{ display: "block", marginBottom: "10px", color: "#334155", fontWeight: "600" }}>
                Mô tả
              </label>
              <textarea
                name="description"
                value={createForm.description}
                onChange={handleCreateInputChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  marginBottom: "14px",
                  resize: "vertical"
                }}
                placeholder="Mô tả ngắn về sản phẩm"
              />

              <label style={{ display: "block", marginBottom: "10px", color: "#334155", fontWeight: "600" }}>
                Giá
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={createForm.price}
                onChange={handleCreateInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  marginBottom: "14px"
                }}
                placeholder="Nhập giá sản phẩm"
              />

              <label style={{ display: "block", marginBottom: "10px", color: "#334155", fontWeight: "600" }}>
                Hình ảnh sản phẩm
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesChange}
                style={{ marginBottom: "18px" }}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#334155",
                    cursor: createLoading ? "not-allowed" : "pointer"
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: "8px",
                    background: createLoading ? "#94a3b8" : "#16a34a",
                    color: "#fff",
                    fontWeight: "600",
                    cursor: createLoading ? "not-allowed" : "pointer"
                  }}
                >
                  {createLoading ? "Đang tạo..." : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupplierProducts;
