import "dotenv/config";

import { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";
import "hardhat-docgen";
import "hardhat-contract-sizer";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "./tasks/index.ts";

const chainIds = {
  rinkeby: 4,
};

let mnemonic: string;
if (!process.env.MNEMONIC) {
  throw new Error("Please set your MNEMONIC in a .env file");
} else {
  mnemonic = process.env.MNEMONIC;
}

let alchemyApiKey: string;
if (!process.env.ALCHEMY_URL) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
} else {
  alchemyApiKey = process.env.ALCHEMY_URL;
}

function createNetworkConfig(
  network: keyof typeof chainIds
): NetworkUserConfig {
  const url: string = alchemyApiKey;
  return {
    accounts: {
      count: 2,
      mnemonic,
      // process.env.RINKEBY_PRIVATE_KEY !== undefined ? [process.env.RINKEBY_PRIVATE_KEY] : [],
    },
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: createNetworkConfig("rinkeby"),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  docgen: {
    path: "./docs",
    runOnCompile: true,
  },
  contractSizer: {
    alphaSort: false,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: false,
  },
  gasReporter: {
    enabled: process.env.GAS ? true : false,
    currency: "USD",
    token: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.CMC_API_KEY,
  },
};

export default config;
