import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import api from "../services/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalClients: 0,
        totalFreelancers: 0,
        totalJobs: 0,
        totalTransactions: 0
    });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get(
                    "/admin/dashboard"
                );

            setStats({
                totalUsers:
                    response.data?.stats?.totalUsers || 0,

                totalClients:
                    response.data?.stats?.totalClients || 0,

                totalFreelancers:
                    response.data?.stats?.totalFreelancers || 0,

                totalJobs:
                    response.data?.stats?.totalJobs || 0,

                totalTransactions:
                    response.data?.stats?.totalTransactions || 0
            });

        } catch (error) {
            console.error(
                "Load admin dashboard error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Không thể tải dữ liệu quản trị."
            );

        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Đang tải dữ liệu...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">

            {/* HEADER */}

            <div className="admin-header">

                <div>
                    <h1>
                        Bảng điều khiển quản trị
                    </h1>

                    <p>
                        Quản lý người dùng, công việc,
                        giao dịch và hệ thống ký quỹ.
                    </p>
                </div>

                <Link
                    to="/admin/create-client"
                    className="admin-primary-button"
                >
                    + Tạo tài khoản khách hàng
                </Link>

            </div>


            {/* ERROR */}

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}


            {/* STATISTICS */}

            <div className="admin-stats-grid">

                <div className="admin-stat-card">

                    <div className="admin-stat-title">
                        Tổng số người dùng
                    </div>

                    <div className="admin-stat-number">
                        {stats.totalUsers}
                    </div>

                    <div className="admin-stat-description">
                        Tất cả tài khoản hệ thống
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-title">
                        Khách hàng
                    </div>

                    <div className="admin-stat-number">
                        {stats.totalClients}
                    </div>

                    <div className="admin-stat-description">
                        Người đăng tuyển dụng
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-title">
                        Freelancer
                    </div>

                    <div className="admin-stat-number">
                        {stats.totalFreelancers}
                    </div>

                    <div className="admin-stat-description">
                        Người nhận công việc
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-title">
                        Công việc
                    </div>

                    <div className="admin-stat-number">
                        {stats.totalJobs}
                    </div>

                    <div className="admin-stat-description">
                        Tổng số công việc
                    </div>

                </div>


                <div className="admin-stat-card">

                    <div className="admin-stat-title">
                        Giao dịch
                    </div>

                    <div className="admin-stat-number">
                        {stats.totalTransactions}
                    </div>

                    <div className="admin-stat-description">
                        Giao dịch ký quỹ
                    </div>

                </div>

            </div>


            {/* MANAGEMENT */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>
                        <h2>
                            Quản lý hệ thống
                        </h2>

                        <p>
                            Các chức năng dành riêng
                            cho quản trị viên.
                        </p>
                    </div>

                </div>


                <div className="admin-action-grid">

                    <Link
                        to="/admin/users"
                        className="admin-action-card"
                    >
                        <div className="admin-action-icon">
                            👥
                        </div>

                        <div>
                            <h3>
                                Quản lý tài khoản
                            </h3>

                            <p>
                                Xem và quản lý Client,
                                Freelancer và trạng thái
                                tài khoản.
                            </p>
                        </div>
                    </Link>


                    <Link
                        to="/admin/create-client"
                        className="admin-action-card"
                    >
                        <div className="admin-action-icon">
                            ＋
                        </div>

                        <div>
                            <h3>
                                Tạo khách hàng
                            </h3>

                            <p>
                                Tạo tài khoản Client mới
                                có quyền đăng công việc
                                và sử dụng escrow.
                            </p>
                        </div>
                    </Link>

                </div>

            </div>


            {/* ADMIN PERMISSION */}

            <div className="admin-permission-card">

                <div>
                    <span className="admin-badge">
                        ADMIN
                    </span>

                    <h2>
                        Quyền quản trị cao nhất
                    </h2>

                    <p>
                        Quản trị viên có toàn quyền
                        quản lý hệ thống Freelance Escrow.
                        Tài khoản Client chỉ được tạo
                        bởi quản trị viên.
                    </p>
                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;