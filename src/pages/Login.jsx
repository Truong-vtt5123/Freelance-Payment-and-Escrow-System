import {
    useEffect,
    useState
} from "react";

import {
    Link,
    Navigate,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Login() {

    const navigate = useNavigate();

    const {
        user,
        login,
        loading
    } = useAuth();


    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [error, setError] =
        useState("");

    const [submitting, setSubmitting] =
        useState(false);


    // ==========================================
    // NẾU ĐÃ LOGIN -> KHÔNG CHO Ở /login
    // ==========================================

    useEffect(() => {

        if (loading) {
            return;
        }

        if (!user) {
            return;
        }

        if (user.role === "admin") {

            navigate(
                "/admin",
                {
                    replace: true
                }
            );

            return;
        }

        navigate(
            "/dashboard",
            {
                replace: true
            }
        );

    }, [
        user,
        loading,
        navigate
    ]);


    // ==========================================
    // INPUT
    // ==========================================

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


    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            setError("");
            setSubmitting(true);

            try {

                // login() phải return user
                const loggedInUser =
                    await login(
                        form.email,
                        form.password
                    );


                console.log(
                    "LOGIN USER:",
                    loggedInUser
                );


                // ==============================
                // ADMIN
                // ==============================

                if (
                    loggedInUser?.role ===
                    "admin"
                ) {

                    navigate(
                        "/admin",
                        {
                            replace: true
                        }
                    );

                    return;
                }


                // ==============================
                // COMPANY
                // CUSTOMER
                // FREELANCER
                // ==============================

                navigate(
                    "/dashboard",
                    {
                        replace: true
                    }
                );


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );

                setError(
                    error.response
                        ?.data
                        ?.message ||
                    "Đăng nhập thất bại."
                );

            } finally {

                setSubmitting(false);

            }

        };


    // ==========================================
    // AUTH LOADING
    // ==========================================

    if (loading) {

        return (
            <div className="loading">
                Đang kiểm tra đăng nhập...
            </div>
        );

    }


    // ==========================================
    // BẢO VỆ THÊM 1 LỚP
    //
    // Nếu user đã tồn tại thì Login component
    // tuyệt đối không render form.
    // ==========================================

    if (user) {

        if (user.role === "admin") {

            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );

        }

        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );

    }


    // ==========================================
    // LOGIN UI
    // ==========================================

    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-header">

                    <h1>
                        Chào mừng trở lại!
                    </h1>

                    <p>
                        Đăng nhập để quản lý công việc
                        và các khoản thanh toán ký quỹ
                        blockchain.
                    </p>

                </div>


                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Địa chỉ email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="example@gmail.com"
                            autoComplete="email"
                            required
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
                            placeholder="Nhập mật khẩu"
                            autoComplete="current-password"
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={submitting}
                    >

                        {submitting
                            ? "Đang đăng nhập..."
                            : "Đăng nhập"}

                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Bạn chưa có tài khoản?
                    </span>

                    {" "}

                    <Link to="/register">
                        Đăng ký
                    </Link>

                </div>

            </div>

        </div>

    );

}


export default Login;