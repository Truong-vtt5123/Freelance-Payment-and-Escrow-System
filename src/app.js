const express = require("express");
const cors = require("cors");

const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const walletRoutes = require("./routes/walletRoutes");

const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Freelance Escrow API is running",
        paymentMode: "MONGODB_DEMO"
    });
});

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);

app.use(errorMiddleware);

module.exports = app;