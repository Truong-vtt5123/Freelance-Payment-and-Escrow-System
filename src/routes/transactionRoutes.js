const express = require("express");

const {
    getTransactions,
    getJobTransactions
} = require(
    "../controllers/transactionController"
);

const {
    protect
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    getTransactions
);

router.get(
    "/job/:jobId",
    protect,
    getJobTransactions
);

module.exports = router;