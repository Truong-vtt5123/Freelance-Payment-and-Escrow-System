const { ethers } = require("ethers");

const getProvider = () => {
    if (!process.env.RPC_URL) {
        throw new Error(
            "RPC_URL is missing in backend/.env"
        );
    }

    return new ethers.JsonRpcProvider(
        process.env.RPC_URL
    );
};

const getWallet = () => {
    if (!process.env.PRIVATE_KEY) {
        throw new Error(
            "PRIVATE_KEY is missing in backend/.env"
        );
    }

    return new ethers.Wallet(
        process.env.PRIVATE_KEY,
        getProvider()
    );
};

module.exports = {
    getProvider,
    getWallet
};