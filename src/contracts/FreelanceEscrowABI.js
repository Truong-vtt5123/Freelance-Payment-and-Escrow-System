const FreelanceEscrowABI = [

    "function jobCount() view returns (uint256)",

    "function createJob(string title, uint256 amount) returns (uint256)",

    "function acceptJob(uint256 jobId)",

    "function fundJob(uint256 jobId) payable",

    "function submitWork(uint256 jobId)",

    "function releasePayment(uint256 jobId)",

    "function refund(uint256 jobId)",

    "function cancelJob(uint256 jobId)",

    "function getBalance() view returns (uint256)",

    "function getJob(uint256 jobId) view returns (uint256 id, address client, address freelancer, uint256 amount, string title, uint8 status)",

    "event JobCreated(uint256 indexed jobId, address indexed client, uint256 amount, string title)",

    "event JobAccepted(uint256 indexed jobId, address indexed freelancer)",

    "event JobFunded(uint256 indexed jobId, uint256 amount)",

    "event WorkSubmitted(uint256 indexed jobId)",

    "event PaymentReleased(uint256 indexed jobId, address indexed freelancer, uint256 amount)",

    "event Refunded(uint256 indexed jobId, address indexed client, uint256 amount)"

];

export default FreelanceEscrowABI;
