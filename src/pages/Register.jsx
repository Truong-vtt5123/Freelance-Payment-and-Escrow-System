import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import api from "../services/api";


function Register() {

    const navigate =
        useNavigate();


    const [form, setForm] =
        useState({

            name: "",

            email: "",

            password: "",

            confirmPassword: "",

            role: "customer",

            walletAddress: ""

        });


    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =====================================
    // CHANGE INPUT
    // =====================================

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


    // =====================================
    // REGISTER
    // =====================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            setError("");
            setSuccess("");


            // =============================
            // PASSWORD CHECK
            // =============================

            if (
                form.password !==
                form.confirmPassword
            ) {

                setError(
                    "Mật khẩu xác nhận không khớp."
                );

                return;
            }


            if (
                form.password.length < 6
            ) {

                setError(
                    "Mật khẩu phải có ít nhất 6 ký tự."
                );

                return;
            }


            // =============================
            // ROLE CHECK FRONTEND
            // =============================

            const allowedRoles = [
                "customer",
                "freelancer"
            ];


            if (
                !allowedRoles.includes(
                    form.role
                )
            ) {

                setError(
                    "Loại tài khoản không hợp lệ."
                );

                return;
            }


            try {

                setLoading(true);


                // =========================
                // DATA SEND TO BACKEND
                // =========================

                const registerData = {

                    name:
                        form.name.trim(),

                    email:
                        form.email
                            .trim()
                            .toLowerCase(),

                    password:
                        form.password,

                    role:
                        form.role,

                    walletAddress:
                        form.walletAddress.trim()

                };


                await api.post(
                    "/auth/register",
                    registerData
                );


                setSuccess(
                    "Đăng ký tài khoản thành công."
                );


                // =========================
                // GO LOGIN
                // =========================

                setTimeout(() => {

                    navigate("/login");

                }, 1000);


            } catch (error) {

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                setError(

                    error.response
                        ?.data
                        ?.message ||

                    "Không thể đăng ký tài khoản."

                );


            } finally {

                setLoading(false);

            }

        };


    return (

        <div className="auth-page">

            <div className="auth-card">


                {/* ========================= */}
                {/* HEADER */}
                {/* ========================= */}

                <div className="auth-header">

                    <h1>
                        Tạo tài khoản
                    </h1>

                    <p>
                        Đăng ký để sử dụng
                        Freelance Escrow System
                    </p>

                </div>


                {/* ========================= */}
                {/* ERROR */}
                {/* ========================= */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* ========================= */}
                {/* SUCCESS */}
                {/* ========================= */}

                {success && (

                    <div className="success-message">
                        {success}
                    </div>

                )}


                {/* ========================= */}
                {/* FORM */}
                {/* ========================= */}

                <form
                    onSubmit={handleSubmit}
                    className="auth-form"
                >


                    {/* NAME */}

                    <div className="form-group">

                        <label>
                            Họ và tên
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="form-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            required
                        />

                    </div>


                    {/* ACCOUNT TYPE */}

                    <div className="form-group">

                        <label>
                            Loại tài khoản
                        </label>

                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            required
                        >

                            <option value="customer">
                                Khách hàng
                            </option>

                            <option value="freelancer">
                                Freelancer
                            </option>

                        </select>


                        <small>

                            Tài khoản công ty
                            chỉ được cấp bởi
                            quản trị viên.

                        </small>

                    </div>


                    {/* WALLET */}

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

                        <small>
                            Có thể để trống và
                            kết nối MetaMask sau.
                        </small>

                    </div>


                    {/* PASSWORD */}

                    <div className="form-group">

                        <label>
                            Mật khẩu
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={
                                form.password
                            }
                            onChange={handleChange}
                            placeholder="Ít nhất 6 ký tự"
                            minLength="6"
                            required
                        />

                    </div>


                    {/* CONFIRM PASSWORD */}

                    <div className="form-group">

                        <label>
                            Xác nhận mật khẩu
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={
                                form.confirmPassword
                            }
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            minLength="6"
                            required
                        />

                    </div>


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Đang đăng ký..."
                            : "Đăng ký"}

                    </button>

                </form>


                {/* ========================= */}
                {/* LOGIN LINK */}
                {/* ========================= */}

                <div className="auth-footer">

                    <span>
                        Đã có tài khoản?
                    </span>

                    {" "}

                    <Link to="/login">
                        Đăng nhập
                    </Link>

                </div>

            </div>

        </div>

    );
}


export default Register;