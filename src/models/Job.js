const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    amount: { type: String, required: true },
    deadline: { type: Date, required: true },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    blockchainJobId: {
        type: String,
        default: null,
        index: true
    },
    contractAddress: {
        type: String,
        default: ""
    },
    chainId: {
        type: Number,
        default: null
    },
    createTransactionHash: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["CREATED", "ACCEPTED", "FUNDED", "SUBMITTED", "COMPLETED", "REFUNDED", "CANCELLED"],
        default: "CREATED"
    },
    workSubmission: {
        type: String,
        default: ""
    },
    fundedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
}, { timestamps: true });


module.exports = mongoose.model("Job", jobSchema);