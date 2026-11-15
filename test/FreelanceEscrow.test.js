const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelanceEscrow", function () {
    let escrow;
    let client;
    let freelancer;

    beforeEach(async function () {
        [client, freelancer] =
            await ethers.getSigners();

        const FreelanceEscrow =
            await ethers.getContractFactory(
                "FreelanceEscrow"
            );

        escrow = await FreelanceEscrow.deploy();

        await escrow.waitForDeployment();
    });

    it("should create a job", async function () {
        const amount = ethers.parseEther("1");

        await escrow
            .connect(client)
            .createJob(
                "Build Website",
                "Create a React website",
                amount
            );

        const job = await escrow.getJob(1);

        expect(job.title).to.equal(
            "Build Website"
        );

        expect(job.client).to.equal(
            client.address
        );

        expect(job.amount).to.equal(amount);
    });

    it("should allow freelancer to accept job", async function () {
        const amount = ethers.parseEther("1");

        await escrow
            .connect(client)
            .createJob(
                "Build Website",
                "React project",
                amount
            );

        await escrow
            .connect(freelancer)
            .acceptJob(1);

        const job = await escrow.getJob(1);

        expect(job.freelancer).to.equal(
            freelancer.address
        );

        expect(job.status).to.equal(1);
    });

    it("should fund escrow", async function () {
        const amount = ethers.parseEther("1");

        await escrow
            .connect(client)
            .createJob(
                "Build Website",
                "React project",
                amount
            );

        await escrow
            .connect(freelancer)
            .acceptJob(1);

        await escrow
            .connect(client)
            .fundJob(1, {
                value: amount,
            });

        const job = await escrow.getJob(1);

        expect(job.status).to.equal(2);

        const balance =
            await ethers.provider.getBalance(
                await escrow.getAddress()
            );

        expect(balance).to.equal(amount);
    });

    it("should release payment", async function () {
        const amount = ethers.parseEther("1");

        await escrow
            .connect(client)
            .createJob(
                "Build Website",
                "React project",
                amount
            );

        await escrow
            .connect(freelancer)
            .acceptJob(1);

        await escrow
            .connect(client)
            .fundJob(1, {
                value: amount,
            });

        await escrow
            .connect(freelancer)
            .submitWork(1);

        await expect(
            escrow
                .connect(client)
                .releasePayment(1)
        ).to.changeEtherBalances(
            [escrow, freelancer],
            [-amount, amount]
        );

        const job = await escrow.getJob(1);

        expect(job.status).to.equal(4);
    });
});