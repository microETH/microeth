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
    enabled: (process.env.hasOwnProperty('GAS_REPORTER_ENABLE') ? (process.env.GAS_REPORTER_ENABLE === 'true') : false)
  },
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
      // See its defaults
    }
  }
}

if (process.env.hasOwnProperty('ROPSTEN_URL')) {
  module.exports.networks.ropsten = {
    url: process.env.ROPSTEN_URL,
    chainId: 3,
    accounts: [ (process.env.hasOwnProperty('ROPSTEN_PK') ? process.env.ROPSTEN_PK : '') ]
  }
}

if (process.env.hasOwnProperty('RINKEBY_URL')) {
  module.exports.networks.rinkeby = {
    url: process.env.RINKEBY_URL,
    chainId: 4,
    accounts: [ (process.env.hasOwnProperty('RINKEBY_PK') ? process.env.RINKEBY_PK : '') ]
  }
}
