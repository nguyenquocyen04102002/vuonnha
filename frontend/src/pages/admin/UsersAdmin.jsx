import { useEffect, useState } from "react";
import { adminApi } from "../../api/cart";
import { useAuth } from "../../context/AuthContext";

// Phải khớp với ADMIN_EMAIL cấu hình ở backend (mặc định admin@vuonnha.com).
// Đây chỉ là điều kiện ẩn/hiện nút cho gọn giao diện - việc kiểm tra quyền
// THẬT SỰ luôn nằm ở backend (PUT /api/admin/users/{id}/role), nên kể cả
// nếu ai đó lách được điều kiện này ở frontend, backend vẫn sẽ từ chối.
const SUPER_ADMIN_EMAIL = "admin@vuonnha.com";

export default function UsersAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  function load() {
    setLoading(true);
    adminApi.listUsers().then((res) => setUsers(res.data)).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggleRole(target) {
    const newRole = target.role === "admin" ? "customer" : "admin";
    const actionLabel = newRole === "admin" ? "thăng làm Quản trị viên" : "hạ về Khách hàng";
    if (!confirm(`Xác nhận ${actionLabel} cho "${target.name}" (${target.email})?`)) return;

    setUpdatingId(target.id);
    try {
      await adminApi.updateUserRole(target.id, newRole);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <div className="section-eyebrow">Quản lý</div>
          <h2>Danh sách người dùng</h2>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Đang tải...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              {isSuperAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "—"}</td>
                <td>
                  <span className={`badge-role ${u.role}`}>{u.role === "admin" ? "Quản trị" : "Khách hàng"}</span>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
                {isSuperAdmin && (
                  <td>
                    {u.id === user.id ? (
                      <span style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)" }}>Tài khoản của bạn</span>
                    ) : (
                      <button
                        className={`btn btn-sm ${u.role === "admin" ? "btn-danger" : "btn-secondary"}`}
                        disabled={updatingId === u.id}
                        onClick={() => handleToggleRole(u)}
                      >
                        {updatingId === u.id
                          ? "Đang cập nhật..."
                          : u.role === "admin"
                          ? "Hạ về khách hàng"
                          : "Thăng làm Quản trị"}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
