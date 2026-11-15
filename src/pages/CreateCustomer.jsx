
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function CreateCustomer() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        walletAddress: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        if (form.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/admin/customers", {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
                walletAddress: form.walletAddress.trim()
            });

            setSuccess("Tạo tài khoản khách hàng thành công!");

            setTimeout(() => {
                navigate("/admin/users");
            }, 1200);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tạo tài khoản khách hàng."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-card">

                <h1>Tạo tài khoản khách hàng</h1>

                <p>
                    Quản trị viên cấp tài khoản cho khách hàng.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="customer@gmail.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            minLength={6}
                            placeholder="Ít nhất 6 ký tự"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            minLength={6}
                            placeholder="Nhập lại mật khẩu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Địa chỉ ví (không bắt buộc)</label>
                        <input
                            type="text"
                            name="walletAddress"
                            value={form.walletAddress}
                            onChange={handleChange}
                            placeholder="0x..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang tạo tài khoản..."
                            : "Tạo tài khoản khách hàng"}
                    </button>

                    <Link
                        to="/admin"
                        style={{
                            display: "block",
                            marginTop: "16px",
                            textAlign: "center"
                        }}
                    >
                        Quay lại quản trị
                    </Link>

                </form>
            </div>
        </div>
    );
}

export default CreateCustomer;
