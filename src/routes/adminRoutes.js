const express = require("express");

const {
    getDashboard,
    getUsers,
    createCompany,
    createCustomer,
    toggleUserStatus
} = require(
    "../controllers/adminController"
);

const {
    protect,
    authorize
} = require(
    "../middleware/authMiddleware"
);

const router = express.Router();


// =========================================
// TẤT CẢ ROUTE BÊN DƯỚI
// PHẢI ĐĂNG NHẬP + ADMIN
// =========================================

router.use(
    protect,
    authorize("admin")
);


router.get(
    "/dashboard",
    getDashboard
);


router.get(
    "/users",
    getUsers
);


router.post(
    "/companies",
    createCompany
);

router.post(
    "/customers",
    createCustomer
);

router.patch(
    "/users/:id/status",
    toggleUserStatus
);


module.exports = router;