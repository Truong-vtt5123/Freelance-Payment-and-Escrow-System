import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { connectWallet } from "../services/blockchain.js";
import { useLanguage } from "../i18n/LanguageContext.jsx";

const labels = {
    vi: {
        heading: "Đăng công việc Freelance",
        subtitle: "Kết nối MetaMask để đăng công việc. Ngân sách được quản lý trong hệ thống.",
        balance: "Số dư tài khoản",
        loadingBalance: "Đang tải...",
        title: "Tên công việc",
        titlePlaceholder: "Nhập tên công việc...",
        description: "Mô tả công việc",
        descriptionPlaceholder: "Nhập yêu cầu công việc...",
        amount: "Ngân sách (ETH)",
        amountPlaceholder: "Ví dụ: 0.05",
        deadline: "Hạn hoàn thành",
        button: "Kết nối MetaMask & Đăng công việc",
        processing: "Đang xử lý...",
        note: "Thanh toán giả lập. Không sử dụng ETH thật hoặc phí gas.",
        noPermission: "Chỉ Company hoặc Customer mới được đăng công việc.",
        invalidAmount: "Ngân sách phải lớn hơn 0.",
        insufficient: "Số dư ảo không đủ.",
        walletRejected: "Bạn đã từ chối kết nối MetaMask.",
        failed: "Không thể đăng công việc.",
        success: "Đã đăng công việc và trừ tiền ảo thành công."
    },
    en: {
        heading: "Post a Freelance Job",
        subtitle: "Connect MetaMask to post a job. Your budget is managed within the system.",
        balance: "Account Balance",
        loadingBalance: "Loading...",
        title: "Job Title",
        titlePlaceholder: "Enter job title...",
        description: "Job Description",
        descriptionPlaceholder: "Enter job requirements...",
        amount: "Budget (ETH)",
        amountPlaceholder: "Example: 0.05",
        deadline: "Deadline",
        button: "Connect MetaMask & Post Job",
        processing: "Processing...",
        note: "Simulated payments only. No real ETH or gas fees.",
        noPermission: "Only Company or Customer accounts can post jobs.",
        invalidAmount: "Budget must be greater than zero.",
        insufficient: "Insufficient virtual balance.",
        walletRejected: "You rejected the MetaMask connection.",
        failed: "Unable to post the job.",
        success: "Job posted and virtual balance deducted successfully."
    }
};

export default function CreateJob() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { language } = useLanguage();

    const text = labels[language] || labels.vi;

    const [form, setForm] = useState({
        title: "",
        description: "",
        amount: "",
        deadline: ""
    });

    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const canCreate = ["company", "customer"].includes(
        user?.role
    );

    useEffect(() => {
        if (!canCreate) return;

        let active = true;

        async function loadBalance() {
            try {
                const response = await api.get(
                    "/wallet/balance"
                );

                if (active) {
                    setBalance(response.data.balance);
                }
            } catch (err) {
                if (active) {
                    setBalance(null);
                    console.error(
                        "Balance loading error:",
                        err
                    );
                }
            }
        }

        loadBalance();

        return () => {
            active = false;
        };
    }, [canCreate]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        const amount = Number(form.amount);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError(text.invalidAmount);
            return;
        }

        setLoading(true);

        try {
            // Chỉ yêu cầu kết nối ví.
            // Không gọi eth_sendTransaction.
            await connectWallet();

            // Đọc số dư từ MongoDB.
            const balanceResponse = await api.get(
                "/wallet/balance"
            );

            const currentBalance = Number(
                balanceResponse.data.balance
            );

            if (amount > currentBalance) {
                setError(text.insufficient);
                setBalance(currentBalance);
                return;
            }

            // Backend kiểm tra và trừ tiền lần cuối.
            const response = await api.post("/jobs", {
                title: form.title.trim(),
                description: form.description.trim(),
                amount: form.amount,
                deadline: form.deadline
            });

            setBalance(response.data.balance);
            setSuccess(text.success);

            navigate(
                `/jobs/${response.data.job._id}`,
                {
                    state: {
                        notice: text.success
                    }
                }
            );
        } catch (err) {
            if (err.code === 4001) {
                setError(text.walletRejected);
            } else {
                setError(
                    err.response?.data?.message ||
                    err.shortMessage ||
                    err.message ||
                    text.failed
                );
            }
        } finally {
            setLoading(false);
        }
    }

    if (!canCreate) {
        return (
            <div className="empty-state">
                <h2>{text.noPermission}</h2>
            </div>
        );
    }

    return (
        <div className="form-page">
            <div className="form-card">
                <h1>{text.heading}</h1>

                <p>{text.subtitle}</p>

                <div
                    style={{
                        padding: "12px 16px",
                        marginBottom: 20,
                        borderRadius: 8,
                        background: "#eef4ff",
                        color: "#183b72"
                    }}
                >
                    <strong>{text.balance}:</strong>{" "}
                    {balance === null
                        ? text.loadingBalance
                        : `${balance} ETH`}
                </div>

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

                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">
                        {text.title}
                    </label>

                    <input
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder={text.titlePlaceholder}
                        maxLength={150}
                        required
                    />

                    <label htmlFor="description">
                        {text.description}
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder={text.descriptionPlaceholder}
                        rows={7}
                        required
                    />

                    <label htmlFor="amount">
                        {text.amount}
                    </label>

                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        min="0.000001"
                        step="0.000001"
                        value={form.amount}
                        onChange={handleChange}
                        placeholder={text.amountPlaceholder}
                        required
                    />

                    <label htmlFor="deadline">
                        {text.deadline}
                    </label>

                    <input
                        id="deadline"
                        name="deadline"
                        type="date"
                        value={form.deadline}
                        onChange={handleChange}
                        min={new Date().toLocaleDateString("en-CA")}
                        required
                    />

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: 20,
                            padding: "14px 20px",
                            fontSize: 16,
                            fontWeight: 700
                        }}
                    >
                        {loading
                            ? text.processing
                            : text.button}
                    </button>
                </form>

                <p className="muted-note">
                    {text.note}
                </p>
            </div>
        </div>
    );
}