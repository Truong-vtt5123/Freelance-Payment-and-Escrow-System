import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";


function CreateCompany() {
    const navigate =
        useNavigate();

    const [form, setForm] =
        useState({
            name: "",
            email: "",
            password: "",
            walletAddress: ""
        });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    const handleChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    const handleSubmit =
        async (event) => {
            event.preventDefault();

            try {
                setLoading(true);
                setError("");
                setSuccess("");

                await api.post(
                    "/admin/companies",
                    form
                );

                setSuccess(
                    "Tạo tài khoản công ty thành công."
                );

                setForm({
                    name: "",
                    email: "",
                    password: "",
                    walletAddress: ""
                });

                setTimeout(() => {
                    navigate(
                        "/admin/users"
                    );
                }, 1000);

            } catch (error) {
                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Không thể tạo tài khoản công ty."
                );

            } finally {
                setLoading(false);
            }
        };


    return (
        <div className="form-page">

            <div className="form-card">

                <h1>
                    Tạo tài khoản công ty
                </h1>

                <p>
                    Chỉ quản trị viên mới có
                    quyền cấp tài khoản công ty.
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


                <form
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Tên công ty
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="ABC Company"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="company@example.com"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Mật khẩu
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Địa chỉ ví
                        </label>

                        <input
                            type="text"
                            name="walletAddress"
                            value={
                                form.walletAddress
                            }
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
                            ? "Đang tạo..."
                            : "Tạo tài khoản công ty"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateCompany;