const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ["CREATE", "ACCEPT", "DEPOSIT", "SUBMIT", "RELEASE", "REFUND", "CANCEL"],
        required: true
    },
    transactionHash: {
        type: String,
        trim: true
    },
    amount: {
        type: String,
        default: "0"
    },
    fromAddress: {
        type: String,
        default: ""
    },
    toAddress: {
        type: String,
        default: ""
    },
    blockNumber: {
        type: Number,
        default: null
    },
    chainId: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "SUCCESS"
    },
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// A transaction hash is unique when present. Leaving it undefined for
// non-chain legacy records keeps the sparse index from indexing empty strings.
transactionSchema.index(
    { transactionHash: 1 },
    { unique: true, sparse: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);