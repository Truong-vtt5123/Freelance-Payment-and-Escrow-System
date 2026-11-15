import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({
    children,
    roles = []
}) {
    const {
        user,
        loading
    } = useAuth();

    // Đang đọc user từ localStorage
    if (loading) {
        return (
            <div
                style={{
                    padding: "40px",
                    textAlign: "center"
                }}
            >
                Đang tải...
            </div>
        );
    }

    // Chưa đăng nhập
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    console.log(
        "PROTECTED ROUTE USER:",
        user
    );

    console.log(
        "PROTECTED ROUTE ROLE:",
        user.role
    );

    console.log(
        "ALLOWED ROLES:",
        roles
    );

    // Không truyền roles => chỉ cần đăng nhập
    if (!roles || roles.length === 0) {
        return children;
    }

    // Role không được phép
    if (!roles.includes(user.role)) {

        console.error(
            "ROLE NOT ALLOWED:",
            user.role
        );

        // Admin
        if (user.role === "admin") {
            return (
                <Navigate
                    to="/admin"
                    replace
                />
            );
        }

        // User khác
        return (
            <div
                style={{
                    padding: "40px"
                }}
            >
                <h2>
                    Không có quyền truy cập
                </h2>

                <p>
                    Role hiện tại:
                    {" "}
                    <strong>
                        {user.role || "không xác định"}
                    </strong>
                </p>

                <p>
                    Trang này cho phép:
                    {" "}
                    <strong>
                        {roles.join(", ")}
                    </strong>
                </p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;