const hre = require("hardhat");

async function main() {

    console.log(
        "Deploying FreelanceEscrow..."
    );

    const FreelanceEscrow =
        await hre.ethers.getContractFactory(
            "FreelanceEscrow"
        );

    const escrow =
        await FreelanceEscrow.deploy();

    await escrow.waitForDeployment();

    const address =
        await escrow.getAddress();

    console.log(
        "================================"
    );

    console.log(
        "FreelanceEscrow deployed successfully"
    );

    console.log(
        "Contract Address:",
        address
    );

    console.log(
        "Network:",
        hre.network.name
    );

    console.log(
        "================================"
    );
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {

        console.error(error);

        process.exit(1);
    });