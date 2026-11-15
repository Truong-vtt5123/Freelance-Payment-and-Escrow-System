const { ethers } = require("ethers");

const ABI = [
    "function getJob(uint256 jobId) view returns (uint256 id,address client,address freelancer,uint256 amount,string title,uint8 status)",
    "event JobCreated(uint256 indexed jobId,address indexed client,uint256 amount,string title)",
    "event JobAccepted(uint256 indexed jobId,address indexed freelancer)",
    "event JobFunded(uint256 indexed jobId,uint256 amount)",
    "event WorkSubmitted(uint256 indexed jobId)",
    "event PaymentReleased(uint256 indexed jobId,address indexed freelancer,uint256 amount)",
    "event Refunded(uint256 indexed jobId,address indexed client,uint256 amount)",
    "event JobCancelled(uint256 indexed jobId)"
];

const STATUS = {
    CREATED: 0,
    ACCEPTED: 1,
    FUNDED: 2,
    SUBMITTED: 3,
    COMPLETED: 4,
    REFUNDED: 5,
    CANCELLED: 6
};

function getProvider() {
    if (!process.env.RPC_URL) {
        throw new Error("RPC_URL chưa được cấu hình trong backend/.env");
    }
    return new ethers.JsonRpcProvider(process.env.RPC_URL);
}

function getConfiguredContractAddress() {
    const address = process.env.CONTRACT_ADDRESS;
    if (!address || !ethers.isAddress(address)) {
        throw new Error("CONTRACT_ADDRESS chưa được cấu hình hoặc không hợp lệ trong backend/.env");
    }
    return ethers.getAddress(address);
}

async function getEscrow() {
    const provider = getProvider();
    const address = getConfiguredContractAddress();
    return {
        provider,
        address,
        contract: new ethers.Contract(address, ABI, provider)
    };
}

async function verifyTransaction({ txHash, expectedEvent, expectedJobId, expectedStatus }) {
    if (!txHash || !/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
        const error = new Error("Mã giao dịch Blockchain không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }

    const { provider, address, contract } = await getEscrow();
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
        const error = new Error("Không tìm thấy giao dịch trên Blockchain.");
        error.statusCode = 400;
        throw error;
    }

    if (!tx.to || ethers.getAddress(tx.to) !== address) {
        const error = new Error("Giao dịch không được gửi đến Smart Contract của hệ thống.");
        error.statusCode = 400;
        throw error;
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
        const error = new Error("Giao dịch Blockchain chưa thành công.");
        error.statusCode = 400;
        throw error;
    }

    const iface = contract.interface;
    let matchedEvent = null;

    for (const log of receipt.logs) {
        if (ethers.getAddress(log.address) !== address) continue;
        try {
            const parsed = iface.parseLog(log);
            if (!parsed || parsed.name !== expectedEvent) continue;
            const eventJobId = parsed.args.jobId?.toString();
            if (expectedJobId !== undefined && eventJobId !== String(expectedJobId)) continue;
            matchedEvent = parsed;
            break;
        } catch (_) {
            // Ignore logs emitted by other contracts.
        }
    }

    if (!matchedEvent) {
        const error = new Error(`Không tìm thấy sự kiện ${expectedEvent} tương ứng trong giao dịch.`);
        error.statusCode = 400;
        throw error;
    }

    const chainId = Number((await provider.getNetwork()).chainId);
    let chainJob = null;

    if (expectedJobId !== undefined) {
        chainJob = await contract.getJob(expectedJobId);
        if (Number(chainJob.status) !== expectedStatus) {
            const error = new Error("Trạng thái công việc trên Blockchain chưa đúng với thao tác này.");
            error.statusCode = 409;
            throw error;
        }
    }

    return {
        from: ethers.getAddress(tx.from),
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        chainId,
        event: matchedEvent,
        chainJob,
        contractAddress: address
    };
}

async function bindWalletToUser(user, walletAddress, signature, chainId) {
    const normalized = ethers.getAddress(walletAddress);
    if (!signature) {
        const error = new Error("Thiếu chữ ký xác minh quyền sở hữu ví MetaMask.");
        error.statusCode = 400;
        throw error;
    }
    const message = `Freelance Escrow wallet binding\nUser: ${user._id}\nChain ID: ${chainId}\nWallet: ${normalized}`;
    let recovered;
    try {
        recovered = ethers.getAddress(ethers.verifyMessage(message, signature));
    } catch (_) {
        const error = new Error("Chữ ký xác minh ví không hợp lệ.");
        error.statusCode = 400;
        throw error;
    }
    if (recovered !== normalized) {
        const error = new Error("Chữ ký không thuộc ví gửi giao dịch.");
        error.statusCode = 403;
        throw error;
    }
    if (user.walletAddress && ethers.getAddress(user.walletAddress) !== normalized) {
        const error = new Error("Ví MetaMask hiện tại không khớp với ví đã liên kết tài khoản.");
        error.statusCode = 403;
        throw error;
    }
    if (!user.walletAddress) {
        user.walletAddress = normalized;
        await user.save();
    }
    return normalized;
}

module.exports = {
    ABI,
    STATUS,
    getProvider,
    getEscrow,
    verifyTransaction,
    bindWalletToUser
};