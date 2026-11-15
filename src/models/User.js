const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false
        },

        // =====================================
        // QUYỀN TÀI KHOẢN
        // =====================================

        role: {
            type: String,
            enum: [
                "admin",
                "company",
                "customer",
                "freelancer"
            ],
            default: "customer"
        },

        // =====================================
        // NGUỒN TẠO TÀI KHOẢN
        // =====================================

        accountSource: {
            type: String,
            enum: [
                "system",
                "admin",
                "self"
            ],
            default: "self"
        },

        // Admin nào đã tạo tài khoản company
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        walletAddress: {
            type: String,
            default: "",
            trim: true
        },

        virtualBalance: {
            type: Number,
            default: 10000000,
            min: 0
        },


        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


// =========================================
// HASH PASSWORD
// =========================================

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );

    next();
});


// =========================================
// COMPARE PASSWORD
// =========================================

userSchema.methods.comparePassword =
    async function (password) {
        return bcrypt.compare(
            password,
            this.password
        );
    };


module.exports = mongoose.model(
    "User",
    userSchema
);
