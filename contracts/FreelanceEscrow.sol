// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FreelanceEscrow {

    address public owner;
    uint256 public jobCount;

    enum JobStatus {
        Created,
        Accepted,
        Funded,
        Submitted,
        Completed,
        Refunded,
        Cancelled
    }

    struct Job {
        uint256 id;
        address payable client;
        address payable freelancer;
        uint256 amount;
        string title;
        JobStatus status;
        bool exists;
    }

    mapping(uint256 => Job) private jobs;

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount,
        string title
    );

    event JobAccepted(
        uint256 indexed jobId,
        address indexed freelancer
    );

    event JobFunded(
        uint256 indexed jobId,
        uint256 amount
    );

    event WorkSubmitted(
        uint256 indexed jobId
    );

    event PaymentReleased(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    event Refunded(
        uint256 indexed jobId,
        address indexed client,
        uint256 amount
    );

    event JobCancelled(
        uint256 indexed jobId
    );

    constructor() {
        owner = msg.sender;
    }

    modifier jobExists(uint256 jobId) {
        require(
            jobs[jobId].exists,
            "Job does not exist"
        );
        _;
    }

    modifier onlyClient(uint256 jobId) {
        require(
            jobs[jobId].client == msg.sender,
            "Only client can perform this action"
        );
        _;
    }

    modifier onlyFreelancer(uint256 jobId) {
        require(
            jobs[jobId].freelancer == msg.sender,
            "Only freelancer can perform this action"
        );
        _;
    }

    function createJob(
        string calldata title,
        uint256 amount
    )
        external
        returns (uint256)
    {
        require(
            bytes(title).length > 0,
            "Title is required"
        );

        require(
            amount > 0,
            "Amount must be greater than zero"
        );

        jobCount++;

        jobs[jobCount] = Job({
            id: jobCount,
            client: payable(msg.sender),
            freelancer: payable(address(0)),
            amount: amount,
            title: title,
            status: JobStatus.Created,
            exists: true
        });

        emit JobCreated(
            jobCount,
            msg.sender,
            amount,
            title
        );

        return jobCount;
    }

    function acceptJob(
        uint256 jobId
    )
        external
        jobExists(jobId)
    {
        Job storage job = jobs[jobId];

        require(
            job.status == JobStatus.Created,
            "Job cannot be accepted"
        );

        require(
            msg.sender != job.client,
            "Client cannot accept own job"
        );

        job.freelancer =
            payable(msg.sender);

        job.status =
            JobStatus.Accepted;

        emit JobAccepted(
            jobId,
            msg.sender
        );
    }

    function fundJob(
        uint256 jobId
    )
        external
        payable
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status == JobStatus.Accepted,
            "Job must be accepted first"
        );

        require(
            msg.value == job.amount,
            "Incorrect payment amount"
        );

        job.status =
            JobStatus.Funded;

        emit JobFunded(
            jobId,
            msg.value
        );
    }

    function submitWork(
        uint256 jobId
    )
        external
        jobExists(jobId)
        onlyFreelancer(jobId)
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status == JobStatus.Funded,
            "Job is not funded"
        );

        job.status =
            JobStatus.Submitted;

        emit WorkSubmitted(jobId);
    }

    function releasePayment(
        uint256 jobId
    )
        external
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status == JobStatus.Submitted,
            "Work has not been submitted"
        );

        uint256 payment =
            job.amount;

        job.status =
            JobStatus.Completed;

        (bool success, ) =
            job.freelancer.call{
                value: payment
            }("");

        require(
            success,
            "Payment transfer failed"
        );

        emit PaymentReleased(
            jobId,
            job.freelancer,
            payment
        );
    }

    function refund(
        uint256 jobId
    )
        external
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status == JobStatus.Funded,
            "Job cannot be refunded"
        );

        uint256 payment =
            job.amount;

        job.status =
            JobStatus.Refunded;

        (bool success, ) =
            job.client.call{
                value: payment
            }("");

        require(
            success,
            "Refund failed"
        );

        emit Refunded(
            jobId,
            job.client,
            payment
        );
    }

    function cancelJob(
        uint256 jobId
    )
        external
        jobExists(jobId)
        onlyClient(jobId)
    {
        Job storage job =
            jobs[jobId];

        require(
            job.status == JobStatus.Created,
            "Job cannot be cancelled"
        );

        job.status =
            JobStatus.Cancelled;

        emit JobCancelled(jobId);
    }

    function getJob(
        uint256 jobId
    )
        external
        view
        jobExists(jobId)
        returns (
            uint256 id,
            address client,
            address freelancer,
            uint256 amount,
            string memory title,
            JobStatus status
        )
    {
        Job storage job =
            jobs[jobId];

        return (
            job.id,
            job.client,
            job.freelancer,
            job.amount,
            job.title,
            job.status
        );
    }

    function getBalance()
        external
        view
        returns (uint256)
    {
        return address(this).balance;
    }
}