const jwt = require("jsonwebtoken");
const User = require("../models/User");


// =========================================
// AUTHENTICATE
// =========================================

const protect = async (
    req,
    res,
    next
) => {
    try {
        let token;

        const authorization =
            req.headers.authorization;

        if (
            authorization &&
            authorization.startsWith("Bearer ")
        ) {
            token =
                authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        const user =
            await User.findById(
                decoded.id
            ).select("-password");

        if (!user) {
            return res.status(401).json({
                message:
                    "User no longer exists"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message:
                    "Account has been disabled"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message:
                "Invalid or expired token"
        });
    }
};


// =========================================
// ROLE AUTHORIZATION
// =========================================

const authorize = (...roles) => {
    return (
        req,
        res,
        next
    ) => {

        if (!req.user) {
            return res.status(401).json({
                message:
                    "Authentication required"
            });
        }

        if (
            !roles.includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                message:
                    "You do not have permission to perform this action"
            });
        }

        next();
    };
};


module.exports = {
    protect,
    authorize
};