require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const { toUnits } = require("../utils/virtualMoney");

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const result = await User.updateMany(
            {
                virtualBalance: {
                    $exists: false
                }
            },
            {
                $set: {
                    virtualBalance: toUnits("10")
                }
            }
        );

        console.log(
            `Đã khởi tạo 10 ETH ảo cho ${result.modifiedCount} tài khoản.`
        );
    } catch (error) {
        console.error("Lỗi:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main();