import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import dotenv from "dotenv";
import { ChainID } from "./scripts/microeth/Constants";

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
        runs: 5000
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
  },
  mocha: {
    timeout: 300000
  }
}

if (process.env.hasOwnProperty('ROPSTEN_URL')) {
  module.exports.networks.ropsten = {
    url: process.env.ROPSTEN_URL,
    chainId: ChainID.Ropsten,
    accounts: [],
    testContract: (process.env.hasOwnProperty('ROPSTEN_TEST_CONTRACT') ? process.env.ROPSTEN_TEST_CONTRACT : '')
  }

  if (process.env.hasOwnProperty('ROPSTEN_PK') && process.env.ROPSTEN_PK !== undefined) {
    module.exports.networks.ropsten.accounts = process.env.ROPSTEN_PK.split(',');
  }
}

if (process.env.hasOwnProperty('RINKEBY_URL')) {
  module.exports.networks.rinkeby = {
    url: process.env.RINKEBY_URL,
    chainId: ChainID.Rinkeby,
    accounts:[],
    testContract: (process.env.hasOwnProperty('RINKEBY_TEST_CONTRACT') ? process.env.RINKEBY_TEST_CONTRACT : '')
  }

  if (process.env.hasOwnProperty('RINKEBY_PK') && process.env.RINKEBY_PK !== undefined) {
    module.exports.networks.rinkeby.accounts = process.env.RINKEBY_PK.split(',');
  }
}

if (process.env.hasOwnProperty('MAINNET_URL')) {
  module.exports.networks.mainnet = {
    url: process.env.MAINNET_URL,
    chainId: ChainID.Mainnet,
    accounts:[],
    testContract: (process.env.hasOwnProperty('MAINNET_TEST_CONTRACT') ? process.env.MAINNET_TEST_CONTRACT : '')
  }

  if (process.env.hasOwnProperty('MAINNET_PK') && process.env.MAINNET_PK !== undefined) {
    module.exports.networks.mainnet.accounts = process.env.MAINNET_PK.split(',');
  }
}
