
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const statusNames = {
    CREATED: "Đang tuyển",
    ACCEPTED: "Đã nhận việc",
    FUNDED: "Đã ký quỹ ",
    SUBMITTED: "Đã bàn giao",
    COMPLETED: "Hoàn thành",
    REFUNDED: "Đã hoàn tiền p",
    CANCELLED: "Đã hủy"
};

export default function JobDetails() {
    const { id } = useParams();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [workSubmission, setWorkSubmission] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const userId = String(user?.id || user?._id || "");

    const isClient =
        !!job?.client &&
        String(job.client._id || job.client) === userId;

    const isFreelancer =
        !!job?.freelancer &&
        String(job.freelancer._id || job.freelancer) === userId;

    const loadJob = async () => {
        const jobResponse = await api.get(`/jobs/${id}`);

        const currentJob = jobResponse.data.job;

        setJob(currentJob);
        setWorkSubmission(currentJob.workSubmission || "");

        try {
            const txResponse = await api.get(
                `/transactions/job/${id}`
            );

            setTransactions(
                txResponse.data.transactions || []
            );
        } catch (err) {
            if (err.response?.status === 403) {
                setTransactions([]);
            } else {
                throw err;
            }
        }
    };

    useEffect(() => {
        let active = true;

        async function fetchData() {
            setLoading(true);
            setError("");

            try {
                const jobResponse = await api.get(
                    `/jobs/${id}`
                );

                if (!active) return;

                const currentJob = jobResponse.data.job;

                setJob(currentJob);
                setWorkSubmission(
                    currentJob.workSubmission || ""
                );

                try {
                    const txResponse = await api.get(
                        `/transactions/job/${id}`
                    );

                    if (active) {
                        setTransactions(
                            txResponse.data.transactions || []
                        );
                    }
                } catch (err) {
                    if (
                        active &&
                        err.response?.status !== 403
                    ) {
                        setError(
                            "Không thể tải lịch sử giao dịch."
                        );
                    }
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Không thể tải công việc."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchData();

        return () => {
            active = false;
        };
    }, [id]);

    const runAction = async (endpoint, payload = {}) => {
        setActionLoading(true);
        setError("");
        setNotice("");

        try {
            const response = await api.put(
                `/jobs/${id}/${endpoint}`,
                payload
            );

            await loadJob();

            setNotice(
                response.data.message ||
                "Đã cập nhật công việc thành công."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Thao tác thất bại."
            );

            try {
                await loadJob();
            } catch (_) {
                // Giữ lại lỗi ban đầu.
            }
        } finally {
            setActionLoading(false);
        }
    };

    const accept = () => {
        runAction("accept");
    };

    const fund = () => {
        if (
            !window.confirm(
                "Xác nhận ký quỹ ? Không có ETH được chuyển."
            )
        ) {
            return;
        }

        runAction("fund");
    };

    const submit = () => {
        if (!workSubmission.trim()) {
            setError(
                "Vui lòng nhập nội dung bàn giao."
            );
            return;
        }

        runAction("submit", {
            workSubmission: workSubmission.trim()
        });
    };

    const release = () => {
        if (
            !window.confirm(
                "Xác nhận giải ngân ? Không có tiền thật được chuyển."
            )
        ) {
            return;
        }

        runAction("release");
    };

    const refund = () => {
        if (
            !window.confirm(
                "Xác nhận hoàn tiền? Thao tác này chỉ thay đổi dữ liệu MongoDB."
            )
        ) {
            return;
        }

        runAction("refund");
    };

    const cancel = () => {
        if (
            !window.confirm(
                "Bạn chắc chắn muốn hủy công việc?"
            )
        ) {
            return;
        }

        runAction("cancel");
    };

    if (loading) {
        return (
            <div className="page-loading">
                Đang tải công việc...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="empty-state">
                <h2>Không tìm thấy công việc</h2>
                {error && <p>{error}</p>}
            </div>
        );
    }

    return (
        <div className="job-details">
            <div className="success-message">
                DEMO MODE — Mọi khoản thanh toán đều
                là giả lập, không chuyển ETH.
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {notice && (
                <div className="success-message">
                    {notice}
                </div>
            )}

            <div className="job-details-card">
                <div className="job-card-header">
                    <div>
                        <p className="eyebrow">
                            JOB DETAILS · MONGODB
                        </p>

                        <h1>{job.title}</h1>
                    </div>

                    <span
                        className={
                            `status status-${job.status?.toLowerCase()}`
                        }
                    >
                        {statusNames[job.status] || job.status}
                    </span>
                </div>

                <div className="details-grid">
                    <div>
                        <span>Ngân sách </span>
                        <strong>{job.amount} ETH</strong>
                    </div>

                    <div>
                        <span>Hạn hoàn thành</span>
                        <strong>
                            {new Date(
                                job.deadline
                            ).toLocaleDateString("vi-VN")}
                        </strong>
                    </div>

                    <div>
                        <span>Khách hàng</span>
                        <strong>
                            {job.client?.name || "—"}
                        </strong>
                    </div>

                    <div>
                        <span>Freelancer</span>
                        <strong>
                            {job.freelancer?.name ||
                                "Chưa có người nhận"}
                        </strong>
                    </div>

                    <div>
                        <span>Chế độ thanh toán</span>
                        <strong>MongoDB Simulation</strong>
                    </div>
                </div>

                <section className="job-description-section">
                    <h3>Mô tả công việc</h3>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                        {job.description}
                    </p>
                </section>

                {job.workSubmission && (
                    <section className="job-description-section">
                        <h3>Sản phẩm đã bàn giao</h3>
                        <p style={{ whiteSpace: "pre-wrap" }}>
                            {job.workSubmission}
                        </p>
                    </section>
                )}

                <div className="job-actions">
                    {user?.role === "freelancer" &&
                        job.status === "CREATED" && (
                            <button
                                className="primary-button"
                                disabled={actionLoading}
                                onClick={accept}
                            >
                                Nhận công việc
                            </button>
                        )}

                    {isFreelancer &&
                        job.status === "FUNDED" && (
                            <div className="action-form">
                                <label htmlFor="workSubmission">
                                    Nội dung bàn giao
                                </label>

                                <textarea
                                    id="workSubmission"
                                    rows={5}
                                    value={workSubmission}
                                    onChange={(event) =>
                                        setWorkSubmission(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Nhập đường dẫn sản phẩm hoặc mô tả bàn giao..."
                                />

                                <button
                                    className="primary-button"
                                    disabled={actionLoading}
                                    onClick={submit}
                                >
                                    Bàn giao sản phẩm
                                </button>
                            </div>
                        )}

                    {isClient &&
                        job.status === "SUBMITTED" && (
                            <button
                                className="primary-button"
                                disabled={actionLoading}
                                onClick={release}
                            >
                                Xác nhận giải ngân 
                            </button>
                        )}

                    {isClient &&
                        job.status === "FUNDED" && (
                            <button
                                className="secondary-button"
                                disabled={actionLoading}
                                onClick={refund}
                            >
                                Hoàn tiền 
                            </button>
                        )}

                    {isClient &&
                        job.status === "CREATED" && (
                            <button
                                className="secondary-button"
                                disabled={actionLoading}
                                onClick={cancel}
                            >
                                Hủy công việc
                            </button>
                        )}
                </div>

                {actionLoading && (
                    <p>Đang xử lý yêu cầu...</p>
                )}

                <p className="muted-note">
                    Các thao tác được lưu trong MongoDB.
                    Không sử dụng Smart Contract.
                </p>
            </div>

            <div className="table-card transaction-history">
                <h2>Lịch sử giao dịch </h2>

                {transactions.length === 0 ? (
                    <p className="empty-state">
                        Chưa có giao dịch.
                    </p>
                ) : (
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Loại</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ghi chú</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx._id}>
                                        <td>{tx.type}</td>

                                        <td>
                                            {tx.amount} ETH
                                            <small> ()</small>
                                        </td>

                                        <td>{tx.status}</td>

                                        <td>{tx.note || "—"}</td>

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
