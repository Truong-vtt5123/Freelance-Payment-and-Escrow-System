const express = require("express");
const User = require("../models/User");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    fromUnits
} = require("../utils/virtualMoney");

const router = express.Router();

router.get("/balance", protect, async (req, res, next) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("virtualBalance walletAddress");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tài khoản."
            });
        }

        if (
            !Number.isSafeInteger(user.virtualBalance) ||
            user.virtualBalance < 0
        ) {
            return res.status(409).json({
                success: false,
                message: "Số dư ảo chưa được khởi tạo hợp lệ."
            });
        }

        return res.json({
            success: true,
            balance: fromUnits(user.virtualBalance),
            walletAddress: user.walletAddress || ""
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;