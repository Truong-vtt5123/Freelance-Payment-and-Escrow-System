const mongoose = require("mongoose");
const Job = require("../models/Job");
const Transaction = require("../models/Transaction");

exports.getTransactions = async (req, res, next) => {
    try {
        let filter = {};

        if (req.user.role !== "admin") {
            const jobs = await Job.find({
                $or: [
                    { client: req.user._id },
                    { freelancer: req.user._id }
                ]
            }).select("_id");

            filter = {
                job: {
                    $in: jobs.map(job => job._id)
                }
            };
        }

        const transactions = await Transaction.find(filter)
            .populate("job", "title amount status")
            .populate("user", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        next(error);
    }
};

exports.getJobTransactions = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Mã công việc không hợp lệ."
            });
        }

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy công việc."
            });
        }

        const allowed =
            req.user.role === "admin" ||
            String(job.client) === String(req.user._id) ||
            String(job.freelancer) === String(req.user._id);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem giao dịch."
            });
        }

        const transactions = await Transaction.find({
            job: jobId
        })
            .populate("job", "title amount status")
            .populate("user", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        next(error);
    }
};