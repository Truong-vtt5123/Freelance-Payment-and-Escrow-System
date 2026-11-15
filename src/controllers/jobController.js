const mongoose = require("mongoose");
const Job = require("../models/Job");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const {
    toUnits,
    fromUnits
} = require("../utils/virtualMoney");

const fail = (res, status, message) =>
    res.status(status).json({
        success: false,
        message
    });

const isOwner = (job, user) =>
    String(job.client) === String(user._id);

const isWorker = (job, user) =>
    job.freelancer &&
    String(job.freelancer) === String(user._id);

async function findJob(req, res) {
    if (!mongoose.isValidObjectId(req.params.id)) {
        fail(res, 400, "Mã công việc không hợp lệ.");
        return null;
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
        fail(res, 404, "Không tìm thấy công việc.");
        return null;
    }

    return job;
}

async function logTransaction(job, userId, type, amount, note) {
    return Transaction.create({
        job: job._id,
        user: userId,
        type,
        amount: String(amount),
        status: "SUCCESS",
        note
    });
}

async function changeStatus(job, expected, fields) {
    return Job.findOneAndUpdate(
        {
            _id: job._id,
            status: expected
        },
        {
            $set: fields
        },
        {
            new: true,
            runValidators: true
        }
    );
}

// Đăng Job và trừ tiền ảo.
exports.createJob = async (req, res, next) => {
    let deducted = false;
    let amountUnits = 0;
    let createdJob = null;

    try {
        const title = String(req.body.title || "").trim();
        const description = String(
            req.body.description || ""
        ).trim();

        const deadline = new Date(req.body.deadline);

        if (!title || !description || title.length > 150) {
            return fail(
                res,
                400,
                "Vui lòng nhập tên và mô tả công việc hợp lệ."
            );
        }

        if (
            Number.isNaN(deadline.getTime()) ||
            deadline <= new Date()
        ) {
            return fail(
                res,
                400,
                "Hạn hoàn thành phải là ngày trong tương lai."
            );
        }

        try {
            amountUnits = toUnits(req.body.amount);
        } catch (error) {
            return fail(res, 400, error.message);
        }

        // Chỉ trừ tiền nếu tài khoản có đủ số dư.
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.user._id,
                virtualBalance: {
                    $gte: amountUnits
                }
            },
            {
                $inc: {
                    virtualBalance: -amountUnits
                }
            },
            {
                new: true
            }
        );

        if (!updatedUser) {
            return fail(
                res,
                400,
                "Số dư ảo không đủ hoặc chưa được khởi tạo."
            );
        }

        deducted = true;

        createdJob = await Job.create({
            title,
            description,
            amount: String(fromUnits(amountUnits)),
            deadline,
            client: req.user._id,
            freelancer: null,
            status: "CREATED",
            fundedAt: new Date()
        });

        await logTransaction(
            createdJob,
            req.user._id,
            "DEPOSIT",
            createdJob.amount,
            "Ký quỹ ảo khi đăng công việc"
        );

        return res.status(201).json({
            success: true,
            message: "Đã đăng công việc và trừ tiền ảo thành công.",
            job: createdJob,
            balance: fromUnits(updatedUser.virtualBalance)
        });
    } catch (error) {
        // Bù trừ cho lỗi thông thường trong bản demo.
        if (deducted) {
            try {
                if (createdJob) {
                    await Transaction.deleteMany({
                        job: createdJob._id
                    });

                    await Job.deleteOne({
                        _id: createdJob._id
                    });
                }

                await User.updateOne(
                    { _id: req.user._id },
                    {
                        $inc: {
                            virtualBalance: amountUnits
                        }
                    }
                );
            } catch (rollbackError) {
                console.error(
                    "Rollback failed:",
                    rollbackError
                );
            }
        }

        next(error);
    }
};

// Danh sách công việc.
exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find()
            .populate("client", "name email walletAddress")
            .populate("freelancer", "name email walletAddress")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        next(error);
    }
};

// Công việc của tài khoản.
exports.getMyJobs = async (req, res, next) => {
    try {
        let filter = {};

        if (req.user.role === "freelancer") {
            filter = { freelancer: req.user._id };
        } else if (req.user.role !== "admin") {
            filter = { client: req.user._id };
        }

        const jobs = await Job.find(filter)
            .populate("client", "name email walletAddress")
            .populate("freelancer", "name email walletAddress")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        next(error);
    }
};

// Chi tiết công việc.
exports.getJobById = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        await job.populate(
            "client",
            "name email walletAddress"
        );

        await job.populate(
            "freelancer",
            "name email walletAddress"
        );

        res.json({
            success: true,
            job
        });
    } catch (error) {
        next(error);
    }
};

// Freelancer nhận công việc.
exports.acceptJob = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (job.status !== "CREATED" || !job.fundedAt) {
            return fail(
                res,
                409,
                "Công việc không còn khả dụng."
            );
        }

        const updated = await changeStatus(
            job,
            "CREATED",
            {
                freelancer: req.user._id,
                status: "FUNDED"
            }
        );

        if (!updated) {
            return fail(
                res,
                409,
                "Công việc đã được người khác nhận."
            );
        }

        await logTransaction(
            updated,
            req.user._id,
            "ACCEPT",
            "0",
            "Freelancer nhận công việc"
        );

        res.json({
            success: true,
            message: "Nhận công việc thành công.",
            job: updated
        });
    } catch (error) {
        next(error);
    }
};

// Route tương thích, không trừ tiền lần hai.
exports.fundJob = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (!isOwner(job, req.user)) {
            return fail(res, 403, "Không có quyền ký quỹ.");
        }

        if (job.fundedAt) {
            return res.json({
                success: true,
                message: "Công việc đã được ký quỹ khi đăng.",
                job
            });
        }

        return fail(
            res,
            409,
            "Không thể ký quỹ lần hai."
        );
    } catch (error) {
        next(error);
    }
};

// Freelancer bàn giao.
exports.submitWork = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (!isWorker(job, req.user)) {
            return fail(
                res,
                403,
                "Bạn không phải Freelancer của công việc này."
            );
        }

        const workSubmission = String(
            req.body.workSubmission || ""
        ).trim();

        if (!workSubmission) {
            return fail(
                res,
                400,
                "Vui lòng nhập nội dung bàn giao."
            );
        }

        const updated = await changeStatus(
            job,
            "FUNDED",
            {
                status: "SUBMITTED",
                workSubmission
            }
        );

        if (!updated) {
            return fail(
                res,
                409,
                "Công việc chưa sẵn sàng bàn giao."
            );
        }

        await logTransaction(
            updated,
            req.user._id,
            "SUBMIT",
            "0",
            "Freelancer đã bàn giao sản phẩm"
        );

        res.json({
            success: true,
            message: "Bàn giao thành công.",
            job: updated
        });
    } catch (error) {
        next(error);
    }
};

// Company nghiệm thu và giải ngân.
exports.releasePayment = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (!isOwner(job, req.user)) {
            return fail(
                res,
                403,
                "Không có quyền giải ngân."
            );
        }

        if (!job.freelancer) {
            return fail(
                res,
                409,
                "Công việc chưa có Freelancer."
            );
        }

        const updated = await changeStatus(
            job,
            "SUBMITTED",
            {
                status: "COMPLETED",
                completedAt: new Date()
            }
        );

        if (!updated) {
            return fail(
                res,
                409,
                "Công việc chưa được bàn giao hoặc đã xử lý."
            );
        }

        const result = await User.updateOne(
            { _id: job.freelancer },
            {
                $inc: {
                    virtualBalance: toUnits(job.amount)
                }
            }
        );

        if (result.matchedCount !== 1) {
            throw new Error(
                "Không tìm thấy tài khoản Freelancer để giải ngân."
            );
        }

        await logTransaction(
            updated,
            req.user._id,
            "RELEASE",
            job.amount,
            "Giải ngân ETH ảo cho Freelancer"
        );

        res.json({
            success: true,
            message: "Giải ngân thành công.",
            job: updated
        });
    } catch (error) {
        next(error);
    }
};

// Hoàn tiền khi đã có Freelancer nhưng chưa bàn giao.
exports.refundJob = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (!isOwner(job, req.user)) {
            return fail(res, 403, "Không có quyền hoàn tiền.");
        }

        const updated = await changeStatus(
            job,
            "FUNDED",
            {
                status: "REFUNDED"
            }
        );

        if (!updated) {
            return fail(
                res,
                409,
                "Chỉ có thể hoàn tiền trước khi bàn giao."
            );
        }

        await User.updateOne(
            { _id: job.client },
            {
                $inc: {
                    virtualBalance: toUnits(job.amount)
                }
            }
        );

        await logTransaction(
            updated,
            req.user._id,
            "REFUND",
            job.amount,
            "Hoàn lại ETH ảo cho Company"
        );

        res.json({
            success: true,
            message: "Hoàn tiền thành công.",
            job: updated
        });
    } catch (error) {
        next(error);
    }
};

// Hủy Job chưa được nhận và hoàn tiền.
exports.cancelJob = async (req, res, next) => {
    try {
        const job = await findJob(req, res);
        if (!job) return;

        if (!isOwner(job, req.user)) {
            return fail(res, 403, "Không có quyền hủy.");
        }

        const updated = await changeStatus(
            job,
            "CREATED",
            {
                status: "CANCELLED"
            }
        );

        if (!updated) {
            return fail(
                res,
                409,
                "Chỉ có thể hủy công việc chưa được nhận."
            );
        }

        if (job.fundedAt) {
            await User.updateOne(
                { _id: job.client },
                {
                    $inc: {
                        virtualBalance: toUnits(job.amount)
                    }
                }
            );
        }

        await logTransaction(
            updated,
            req.user._id,
            "CANCEL",
            job.fundedAt ? job.amount : "0",
            "Hủy công việc và hoàn ký quỹ ảo"
        );

        res.json({
            success: true,
            message: "Đã hủy công việc.",
            job: updated
        });
    } catch (error) {
        next(error);
    }
};