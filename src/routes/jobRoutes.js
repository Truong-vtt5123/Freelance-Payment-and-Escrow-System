const express = require("express");
const {
    createJob,
    getJobs,
    getJobById,
    getMyJobs,
    acceptJob,
    fundJob,
    submitWork,
    releasePayment,
    refundJob,
    cancelJob
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getJobs);
router.get("/my-jobs", protect, getMyJobs);

router.post("/", protect, authorize("company", "customer"), createJob);
router.put("/:id/accept", protect, authorize("freelancer"), acceptJob);
router.put("/:id/fund", protect, authorize("company", "customer"), fundJob);
router.put("/:id/submit", protect, authorize("freelancer"), submitWork);
router.put("/:id/release", protect, authorize("company", "customer"), releasePayment);
router.put("/:id/refund", protect, authorize("company", "customer"), refundJob);
router.put("/:id/cancel", protect, authorize("company", "customer"), cancelJob);

router.get("/:id", protect, getJobById);

module.exports = router;