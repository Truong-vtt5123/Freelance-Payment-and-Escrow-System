
import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api.js";

const typeNames = {
    CREATE: "Tạo công việc",
    ACCEPT: "Nhận việc",
    DEPOSIT: "Ký quỹ giả lập",
    SUBMIT: "Bàn giao",
    RELEASE: "Giải ngân giả lập",
    REFUND: "Hoàn tiền giả lập",
    CANCEL: "Hủy công việc"
};

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        let active = true;

        api.get("/transactions")
            .then((response) => {
                if (active) {
                    setTransactions(
                        response.data.transactions || []
                    );
                }
            })
            .catch((err) => {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải giao dịch."
                    );
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        if (filter === "ALL") {
            return transactions;
        }

        return transactions.filter(
            (tx) => tx.type === filter
        );
    }, [transactions, filter]);

    if (loading) {
        return (
            <div className="page-loading">
                Đang tải giao dịch...
            </div>
        );
    }

    return (
        <div className="transactions-page">
            <div className="section-header">
                <div>
                    <h1>Lịch sử giao dịch</h1>

                    <p>
                        Lịch sử hoạt động Escrow giả lập
                        được lưu trong MongoDB.
                    </p>

                    <p>
                        Không có giao dịch Blockchain
                        hoặc chuyển tiền thật.
                    </p>
                </div>

                <select
                    value={filter}
                    onChange={(event) =>
                        setFilter(event.target.value)
                    }
                >
                    <option value="ALL">
                        Tất cả giao dịch
                    </option>

                    {Object.entries(typeNames).map(
                        ([type, name]) => (
                            <option
                                key={type}
                                value={type}
                            >
                                {name}
                            </option>
                        )
                    )}
                </select>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-card">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        Chưa có giao dịch phù hợp.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Công việc</th>
                                    <th>Loại giao dịch</th>
                                    <th>Số tiền</th>
                                    <th>Người thao tác</th>
                                    <th>Trạng thái</th>
                                    <th>Ghi chú</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.map((tx) => (
                                    <tr key={tx._id}>
                                        <td>
                                            {tx.job?.title || "—"}
                                        </td>

                                        <td>
                                            {typeNames[tx.type] ||
                                                tx.type}
                                        </td>

                                        <td>
                                            {tx.amount} ETH
                                            <small> (giả lập)</small>
                                        </td>

                                        <td>
                                            {tx.user?.name || "—"}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    `status status-${tx.status?.toLowerCase()}`
                                                }
                                            >
                                                {tx.status}
                                            </span>
                                        </td>

                                        <td>
                                            {tx.note || "—"}
                                        </td>

                                        <td>
                                            {new Date(
                                                tx.createdAt
                                            ).toLocaleString("vi-VN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
