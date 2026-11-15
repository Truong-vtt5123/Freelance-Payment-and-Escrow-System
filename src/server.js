require("dotenv").config();

const app = require("./app");
const connectDatabase =
    require("./config/database");

const PORT =
    process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(
                "================================"
            );

            console.log(
                "Freelance Escrow Backend"
            );

            console.log(
                `Server: http://localhost:${PORT}`
            );

            console.log(
                `Blockchain RPC: ${process.env.RPC_URL}`
            );

            console.log(
                `Contract: ${
                    process.env
                        .CONTRACT_ADDRESS ||
                    "Not configured"
                }`
            );

            console.log(
                "================================"
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error
        );

        process.exit(1);
    }
};

startServer();