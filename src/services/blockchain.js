
import { ethers } from "ethers";

function requireMetaMask() {
    if (!window.ethereum) {
        throw new Error(
            "Không tìm thấy MetaMask. Hãy cài tiện ích MetaMask."
        );
    }
}

export async function connectWallet() {
    requireMetaMask();

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    if (!accounts || accounts.length === 0) {
        throw new Error("Bạn chưa chọn tài khoản MetaMask.");
    }

    const provider = new ethers.BrowserProvider(
        window.ethereum
    );

    const address = ethers.getAddress(accounts[0]);
    const network = await provider.getNetwork();

    return {
        address,
        chainId: Number(network.chainId),
        provider
    };
}

export async function getConnectedWallet() {
    if (!window.ethereum) {
        return null;
    }

    const accounts = await window.ethereum.request({
        method: "eth_accounts"
    });

    if (!accounts?.length) {
        return null;
    }

    const provider = new ethers.BrowserProvider(
        window.ethereum
    );

    const network = await provider.getNetwork();

    return {
        address: ethers.getAddress(accounts[0]),
        chainId: Number(network.chainId)
    };
}

// Chỉ kết nối ví.
// Không ký giao dịch và không gửi ETH.
export async function createWalletProof() {
    const wallet = await connectWallet();

    return {
        walletAddress: wallet.address,
        chainId: wallet.chainId
    };
}
