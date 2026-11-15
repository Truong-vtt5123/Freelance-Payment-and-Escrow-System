import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


import { useLanguage } from "../i18n/LanguageContext";

function LanguageSelector() {
    const { language, changeLanguage } = useLanguage();

    return (
        <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
        >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
        </select>
    );
}




function Navbar() {


    const { language, setLanguage } = useLanguage();


    const {
        user,
        logout
    } = useAuth();

    const navigate =
        useNavigate();


    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    // =====================================
    // ROLE NAME
    // =====================================

    const getRoleName = (role) => {

        switch (role) {

            case "admin":
                return "Quản trị viên";

            case "company":
                return "Công ty";

            case "customer":
                return "Khách hàng";

            case "freelancer":
                return "Freelancer";

            default:
                return "";
        }

    };


    return (
        <nav className="navbar">

            <div className="navbar-container">

                {/* ========================== */}
                {/* LOGO */}
                {/* ========================== */}

                <div className="navbar-logo">

                    <Link to="/">
                        FreelanceEscrow
                    </Link>

                </div>


                {/* ========================== */}
                {/* CHƯA LOGIN */}
                {/* ========================== */}

                {!user && (

                    <div className="navbar-menu">

                        <Link
                            to="/login"
                            className="nav-link"
                        >
                            Đăng nhập
                        </Link>

                        <Link
                            to="/register"
                            className="nav-link"
                        >
                            Đăng ký
                        </Link>

                    </div>

                )}


                {/* ========================== */}
                {/* ĐÃ LOGIN */}
                {/* ========================== */}

                {user && (

                    <div className="navbar-menu">


                        {/* ====================== */}
                        {/* ADMIN */}
                        {/* ====================== */}

                        {user.role === "admin" && (
                            <>

                                <Link
                                    to="/admin"
                                    className="nav-link"
                                >
                                    Bảng điều khiển
                                </Link>


                                <Link
                                    to="/admin/users"
                                    className="nav-link"
                                >
                                    Người dùng
                                </Link>


                                <Link
                                    to="/admin/create-company"
                                    className="nav-link"
                                >
                                    Tạo tài khoản công ty
                                </Link>

                            </>
                        )}


                        {/* ====================== */}
                        {/* COMPANY */}
                        {/* ====================== */}

                        {user.role === "company" && (
                            <>

                                <Link
                                    to="/dashboard"
                                    className="nav-link"
                                >
                                    Bảng điều khiển
                                </Link>


                                <Link
                                    to="/create-job"
                                    className="nav-link"
                                >
                                    Đăng tuyển
                                </Link>


                                <Link
                                    to="/my-jobs"
                                    className="nav-link"
                                >
                                    Công việc đã đăng
                                </Link>


                                <Link
                                    to="/transactions"
                                    className="nav-link"
                                >
                                    Giao dịch
                                </Link>

                            </>
                        )}


                        {/* ====================== */}
                        {/* CUSTOMER */}
                        {/* ====================== */}

                        {user.role === "customer" && (
                            <>

                                <Link
                                    to="/dashboard"
                                    className="nav-link"
                                >
                                    Bảng điều khiển
                                </Link>


                                <Link
                                    to="/my-jobs"
                                    className="nav-link"
                                >
                                    Công việc
                                </Link>


                                <Link
                                    to="/transactions"
                                    className="nav-link"
                                >
                                    Giao dịch
                                </Link>

                            </>
                        )}


                        {/* ====================== */}
                        {/* FREELANCER */}
                        {/* ====================== */}

                        {user.role === "freelancer" && (
                            <>

                                <Link
                                    to="/dashboard"
                                    className="nav-link"
                                >
                                    Bảng điều khiển
                                </Link>


                                <Link
                                    to="/my-jobs"
                                    className="nav-link"
                                >
                                    Công việc của tôi
                                </Link>


                                <Link
                                    to="/transactions"
                                    className="nav-link"
                                >
                                    Giao dịch
                                </Link>

                            </>
                        )}


                        {/* ====================== */}
                        {/* USER INFO */}
                        {/* ====================== */}

                        <div className="navbar-user">

                            <div className="navbar-user-info">

                                <span className="navbar-user-name">
                                    {user.name}
                                </span>

                                <span className="navbar-user-role">
                                    {getRoleName(
                                        user.role
                                    )}
                                </span>

                            </div>


                            <button
                                type="button"
                                className="logout-button"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>

                        </div>

                    </div>

                )}

                <div className="navbar-language-controls" data-no-translate>
                    <Link
                        to="/settings"
                        className="nav-link"
                    >
                        {language === "vi" ? "⚙ Cài đặt" : "⚙ Settings"}
                    </Link>

                    <select
                        aria-label={
                            language === "vi"
                                ? "Chọn ngôn ngữ"
                                : "Select language"
                        }
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                    >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                    </select>
                </div>


            </div>

        </nav>
    );
}


export default Navbar;
