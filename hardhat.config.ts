import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import dotenv from "dotenv";

dotenv.config();

//
// Tasks
// https://hardhat.org/guides/create-task.html
//

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

//
// Config object export
// https://hardhat.org/config/
//

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: true
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    },
    ropsten: {
      url: process.env.ROPSTEN_URL,
      chainId: 3,
      accounts: [ process.env.ROPSTEN_PK ]
    }
  }
};
