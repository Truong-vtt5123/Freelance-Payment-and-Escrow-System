import { useEffect, useState } from "react";
import api from "../services/api";

function AdminUsers() {
    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);

            const response =
                await api.get("/admin/users");

            setUsers(
                response.data.users || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Cannot load users"
            );

        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId) => {
        try {
            await api.patch(
                `/admin/users/${userId}/status`
            );

            await loadUsers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Cannot update account"
            );
        }
    };

    const getRoleName = (role) => {
        switch (role) {
            case "admin":
                return "Administrator";

            case "client":
                return "Client";

            case "freelancer":
                return "Freelancer";

            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="container">
                Loading users...
            </div>
        );
    }

    return (
        <div className="container">

            <div className="page-header">
                <div>
                    <h1>User Management</h1>

                    <p>
                        Manage system accounts
                        and permissions.
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-wrapper">

                <table className="admin-table">

                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Wallet</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr key={user._id}>

                                <td>
                                    {user.name}
                                </td>

                                <td>
                                    {user.email}
                                </td>

                                <td>
                                    <span
                                        className={
                                            `role-badge ${user.role}`
                                        }
                                    >
                                        {getRoleName(
                                            user.role
                                        )}
                                    </span>
                                </td>

                                <td className="wallet-cell">
                                    {user.walletAddress
                                        ? `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-5)}`
                                        : "Not connected"}
                                </td>

                                <td>
                                    {user.isActive
                                        ? "Active"
                                        : "Disabled"}
                                </td>

                                <td>
                                    {user.role !== "admin" && (
                                        <button
                                            className={
                                                user.isActive
                                                    ? "danger-button"
                                                    : "success-button"
                                            }
                                            onClick={() =>
                                                toggleStatus(
                                                    user._id
                                                )
                                            }
                                        >
                                            {user.isActive
                                                ? "Disable"
                                                : "Enable"}
                                        </button>
                                    )}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default AdminUsers;