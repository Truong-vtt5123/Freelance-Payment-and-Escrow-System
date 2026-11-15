const jwt = require("jsonwebtoken");
const User = require("../models/User");


// =========================================
// CREATE JWT
// =========================================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};


// =========================================
// REGISTER
//
// QUAN TRỌNG:
// Người dùng KHÔNG THỂ tự tạo company/admin
// =========================================

exports.register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            role,
            walletAddress
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "Email already exists"
            });
        }

        // =====================================
        // USER CHỈ ĐƯỢC CHỌN:
        // customer hoặc freelancer
        // =====================================

        let selectedRole = "customer";

        if (role === "freelancer") {
            selectedRole = "freelancer";
        }

        const user = await User.create({
            name: name.trim(),

            email: normalizedEmail,

            password,

            role: selectedRole,

            accountSource: "self",

            createdBy: null,

            walletAddress:
                walletAddress || "",

            isActive: true
        });

        const token =
            generateToken(user);

        return res.status(201).json({
            message:
                "Account registered successfully",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountSource:
                    user.accountSource,
                walletAddress:
                    user.walletAddress
            }
        });

    } catch (error) {
        next(error);
    }
};


// =========================================
// LOGIN
// =========================================

exports.login = async (req, res, next) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const user =
            await User.findOne({
                email:
                    email.toLowerCase().trim()
            }).select("+password");

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message:
                    "This account has been disabled"
            });
        }

        const passwordCorrect =
            await user.comparePassword(
                password
            );

        if (!passwordCorrect) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        const token =
            generateToken(user);

        return res.json({
            message:
                "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountSource:
                    user.accountSource,
                walletAddress:
                    user.walletAddress
            }
        });

    } catch (error) {
        next(error);
    }
};


// =========================================
// CURRENT USER
// =========================================

exports.getMe = async (req, res, next) => {
    try {
        const user =
            await User.findById(
                req.user._id
            ).select("-password");

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }

        return res.json({
            user
        });

    } catch (error) {
        next(error);
    }
};