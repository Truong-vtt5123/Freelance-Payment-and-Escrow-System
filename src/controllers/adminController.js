const User = require("../models/User");
const Job = require("../models/Job");
const Transaction =
    require("../models/Transaction");


// =========================================
// ADMIN DASHBOARD
// =========================================

exports.getDashboard =
    async (req, res, next) => {
        try {
            const [
                totalUsers,
                totalCompanies,
                totalCustomers,
                totalFreelancers,
                totalJobs,
                totalTransactions
            ] = await Promise.all([

                User.countDocuments(),

                User.countDocuments({
                    role: "company"
                }),

                User.countDocuments({
                    role: "customer"
                }),

                User.countDocuments({
                    role: "freelancer"
                }),

                Job.countDocuments(),

                Transaction.countDocuments()

            ]);

            return res.json({
                stats: {
                    totalUsers,
                    totalCompanies,
                    totalCustomers,
                    totalFreelancers,
                    totalJobs,
                    totalTransactions
                }
            });

        } catch (error) {
            next(error);
        }
    };


// =========================================
// GET USERS
// =========================================

exports.getUsers =
    async (req, res, next) => {
        try {
            const users =
                await User.find()
                    .select("-password")
                    .populate(
                        "createdBy",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    });

            return res.json({
                users
            });

        } catch (error) {
            next(error);
        }
    };


// =========================================
// CREATE COMPANY
//
// CHỈ ADMIN GỌI ĐƯỢC
// =========================================

exports.createCompany =
    async (req, res, next) => {
        try {
            const {
                name,
                email,
                password,
                walletAddress
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Name, email and password are required"
                    });
            }

            if (password.length < 6) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Password must contain at least 6 characters"
                    });
            }

            const normalizedEmail =
                email
                    .toLowerCase()
                    .trim();

            const exists =
                await User.findOne({
                    email: normalizedEmail
                });

            if (exists) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Email already exists"
                    });
            }

            const company =
                await User.create({
                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password,

                    role:
                        "company",

                    accountSource:
                        "admin",

                    createdBy:
                        req.user._id,

                    walletAddress:
                        walletAddress || "",

                    isActive:
                        true
                });

            return res
                .status(201)
                .json({
                    message:
                        "Company account created successfully",

                    company: {
                        id:
                            company._id,

                        name:
                            company.name,

                        email:
                            company.email,

                        role:
                            company.role,

                        accountSource:
                            company.accountSource,

                        createdBy:
                            company.createdBy,

                        walletAddress:
                            company.walletAddress
                    }
                });

        } catch (error) {
            next(error);
        }
    };


// =========================================
// ENABLE / DISABLE USER
// =========================================

exports.toggleUserStatus =
    async (req, res, next) => {
        try {
            const user =
                await User.findById(
                    req.params.id
                );

            if (!user) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User not found"
                    });
            }

            if (
                user._id.toString() ===
                req.user._id.toString()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "You cannot disable your own account"
                    });
            }

            if (user.role === "admin") {
                return res
                    .status(403)
                    .json({
                        message:
                            "Administrator account cannot be disabled here"
                    });
            }

            user.isActive =
                !user.isActive;

            await user.save();

            return res.json({
                message:
                    user.isActive
                        ? "Account enabled"
                        : "Account disabled",

                user: {
                    id:
                        user._id,

                    isActive:
                        user.isActive
                }
            });

        } catch (error) {
            next(error);
        }
    };

// =========================================
// CREATE CUSTOMER
// CHỈ ADMIN ĐƯỢC PHÉP TẠO
// =========================================

exports.createCustomer = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            walletAddress
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const customer = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: "customer",
            accountSource: "admin",
            createdBy: req.user._id,
            walletAddress: walletAddress || "",
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "Customer account created successfully",
            customer: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                role: customer.role,
                accountSource: customer.accountSource,
                isActive: customer.isActive
            }
        });

    } catch (error) {
        next(error);
    }
};
