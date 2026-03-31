require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ||
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY],
    },
    hardhat: {
      accounts: [
        {
          privateKey: PRIVATE_KEY,
          balance: "10000000000000000000000",
        },
      ],
    },
  },
};
