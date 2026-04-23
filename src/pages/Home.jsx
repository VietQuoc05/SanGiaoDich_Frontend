import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredRole } from "../utils/auth";
import axiosClient from "../api/axiosClient";

function Home() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [cartLoadingByProduct, setCartLoadingByProduct] = useState({});
  const [cartMessageByProduct, setCartMessageByProduct] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError("");

      const res = await axiosClient.get("/products");
      const payload = res?.data;

      let productList = [];
      if (Array.isArray(payload)) {
        productList = payload;
      } else if (Array.isArray(payload?.data)) {
        productList = payload.data;
      } else if (Array.isArray(payload?.content)) {
        productList = payload.content;
      }

      setProducts(productList);
    } catch (err) {
      console.error(err);
      setProductsError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
    } finally {
      setProductsLoading(false);
    }
  };

  const getPrimaryImageUrl = (product) => {
    const firstImage = Array.isArray(product?.imageUrls) ? product.imageUrls[0] : "";
    if (!firstImage || typeof firstImage !== "string") {
      return "";
    }

    // Encode spaces/special chars in object key while keeping URL structure valid.
    return encodeURI(firstImage);
  };

  const getProductImageUrls = (product) => {
    if (!Array.isArray(product?.imageUrls)) {
      return [];
    }

    return product.imageUrls
      .filter((imageUrl) => typeof imageUrl === "string" && imageUrl.trim() !== "")
      .map((imageUrl) => encodeURI(imageUrl));
  };

  const openPreview = (imageUrl, title) => {
    setPreviewImage(imageUrl);
    setPreviewTitle(title || "Ảnh sản phẩm");
  };

  const closePreview = () => {
    setPreviewImage("");
    setPreviewTitle("");
  };

  const handleAddToCart = async (product) => {
    const productId = product?.id ?? product?.productId;
    if (!productId) {
      return;
    }

    try {
      setCartLoadingByProduct((prev) => ({
        ...prev,
        [productId]: true
      }));

      setCartMessageByProduct((prev) => ({
        ...prev,
        [productId]: ""
      }));

      await axiosClient.post("/cart/add", null, {
        params: {
          productId,
          quantity: 1
        }
      });

      setCartMessageByProduct((prev) => ({
        ...prev,
        [productId]: "Đã thêm vào giỏ hàng"
      }));
    } catch (err) {
      console.error(err);
      setCartMessageByProduct((prev) => ({
        ...prev,
        [productId]: "Không thể thêm vào giỏ hàng"
      }));
    } finally {
      setCartLoadingByProduct((prev) => ({
        ...prev,
        [productId]: false
      }));
    }
  };

  useEffect(() => {
    if (!previewImage) {
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [previewImage]);

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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetchProducts();
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

        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap"
          }}>
            <h2 style={{ margin: 0, fontSize: "24px" }}>Sản phẩm đang bán</h2>
            <button
              onClick={fetchProducts}
              disabled={productsLoading}
              style={{
                padding: "8px 14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: productsLoading ? "#e2e8f0" : "#f8fafc",
                color: "#0f172a",
                cursor: productsLoading ? "not-allowed" : "pointer"
              }}
            >
              {productsLoading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>

          {productsError && (
            <p style={{
              color: "#dc2626",
              background: "#fee2e2",
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "16px"
            }}>
              {productsError}
            </p>
          )}

          {productsLoading ? (
            <p style={{ margin: 0, color: "#475569" }}>Đang tải danh sách sản phẩm...</p>
          ) : products.length === 0 ? (
            <p style={{ margin: 0, color: "#64748b" }}>Hiện chưa có sản phẩm nào đang bán.</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "14px"
            }}>
              {products.map((product, index) => {
                const productId = product?.id ?? product?.productId ?? index;
                const productName = product?.name ?? product?.productName ?? `Sản phẩm #${index + 1}`;
                const productDescription = product?.description ?? product?.shortDescription ?? "Chưa có mô tả";
                const productPrice = product?.price ?? product?.sellingPrice;
                const productStock = product?.stock ?? product?.quantity;
                const productImage = getPrimaryImageUrl(product);
                const productImages = getProductImageUrls(product);
                const isAddingToCart = !!cartLoadingByProduct[productId];
                const cartMessage = cartMessageByProduct[productId] || "";

                return (
                  <article
                    key={productId}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#fff"
                    }}
                  >
                    {productImage ? (
                      <div style={{ marginBottom: "10px" }}>
                        <img
                          src={productImage}
                          alt={productName}
                          loading="lazy"
                          onClick={() => openPreview(productImage, productName)}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                          style={{
                            width: "100%",
                            height: "170px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0",
                            marginBottom: "8px",
                            background: "#f8fafc",
                            cursor: "zoom-in"
                          }}
                        />

                        {productImages.length > 1 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                              gap: "6px"
                            }}
                          >
                            {productImages.map((imageUrl, imageIndex) => (
                              <button
                                type="button"
                                key={`${productId}-img-${imageIndex}`}
                                onClick={() => openPreview(imageUrl, `${productName} - ảnh ${imageIndex + 1}`)}
                                style={{
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "8px",
                                  padding: "0",
                                  overflow: "hidden",
                                  background: "#fff",
                                  cursor: "zoom-in"
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`${productName} ${imageIndex + 1}`}
                                  loading="lazy"
                                  style={{
                                    width: "100%",
                                    height: "56px",
                                    display: "block",
                                    objectFit: "cover"
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "170px",
                          borderRadius: "10px",
                          border: "1px dashed #cbd5e1",
                          marginBottom: "10px",
                          color: "#64748b",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "14px",
                          background: "#f8fafc"
                        }}
                      >
                        Không có ảnh
                      </div>
                    )}

                    <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#0f172a" }}>{productName}</h3>
                    <p style={{ margin: "0 0 12px", color: "#475569", minHeight: "42px" }}>{productDescription}</p>
                    <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#0f172a" }}>{formatCurrency(productPrice)}</p>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                      Tồn kho: {Number.isFinite(Number(productStock)) ? Number(productStock) : "Không rõ"}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      disabled={isAddingToCart}
                      style={{
                        marginTop: "12px",
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "9px",
                        border: "none",
                        background: isAddingToCart ? "#94a3b8" : "#0f172a",
                        color: "#fff",
                        cursor: isAddingToCart ? "not-allowed" : "pointer",
                        fontWeight: 600
                      }}
                    >
                      {isAddingToCart ? "Đang thêm..." : "Add to cart"}
                    </button>

                    {cartMessage && (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "13px",
                          color: cartMessage.includes("Không thể") ? "#dc2626" : "#16a34a"
                        }}
                      >
                        {cartMessage}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

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
            onClick={() => navigate("/cart")}
            style={{
              padding: "12px 18px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            View Cart
          </button>

          <button
            onClick={() => navigate("/orders")}
            style={{
              padding: "12px 18px",
              background: "#0ea5e9",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer"
            }}
          >
            My Orders
          </button>

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

      {previewImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={closePreview}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              closePreview();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            zIndex: 1000
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(1000px, 100%)",
              maxHeight: "90vh",
              background: "#ffffff",
              borderRadius: "14px",
              padding: "14px",
              boxShadow: "0 10px 40px rgba(2, 6, 23, 0.3)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                gap: "10px"
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{previewTitle}</p>
              <button
                type="button"
                onClick={closePreview}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                  color: "#0f172a",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  cursor: "pointer"
                }}
              >
                Đóng
              </button>
            </div>

            <img
              src={previewImage}
              alt={previewTitle}
              style={{
                width: "100%",
                maxHeight: "calc(90vh - 90px)",
                objectFit: "contain",
                borderRadius: "10px",
                background: "#f8fafc"
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;