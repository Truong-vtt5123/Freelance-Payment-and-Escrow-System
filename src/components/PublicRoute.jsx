import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading">
                Đang tải...
            </div>
        );
    }

    // Chưa đăng nhập -> cho xem Login/Register
    if (!user) {
        return children;
    }

    // Đã đăng nhập Admin -> Admin Dashboard
    if (user.role === "admin") {
        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    // Company / Customer / Freelancer
    return (
        <Navigate
            to="/dashboard"
            replace
        />
    );
}

export default PublicRoute;