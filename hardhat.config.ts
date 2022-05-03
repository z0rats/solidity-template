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
  ganache: 1337,
  hardhat: 31337,
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  goerli: 5,
  kovan: 42,
  mumbai: 80001,
  matic: 137,
  bscTestnet: 97,
};

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  throw new Error("Please set your ALCHEMY_API_KEY in a .env file");
}

const alchemyPolygonKey: string | undefined = process.env.ALCHEMY_POLYGON_KEY;
if (!alchemyPolygonKey) {
  throw new Error("Please set your ALCHEMY_POLYGON_KEY in a .env file");
}

function createNetworkConfig(network: keyof typeof chainIds): NetworkUserConfig {
  let url: string;
  if (network === "mumbai")
    url = `https://polygon-${network}.g.alchemy.com/v2/${alchemyPolygonKey}`;
  else url = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;

  return {
    accounts: {
      count: 10,
      mnemonic,
    },
    // accounts: [privateKey1, privateKey2, ...],
    // Ledger config
    // accounts: [
    //   {
    //     platform: "ledger",
    //     type: "hid",
    //     path: "m/44'/60'/0'/0/0"
    //   }
    // ],
    chainId: chainIds[network],
    url,
    // gas: 2100000,
    // gasPrice: 8000000000,
  };
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.7.6",
      },
    ],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // forking: {
      //   url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_MAINNET}`,
      //   blockNumber: 14081268, // pinning a block to enable caching
      // },
    },
    mumbai: createNetworkConfig("mumbai"),
    rinkeby: createNetworkConfig("rinkeby"),
    kovan: createNetworkConfig("kovan"),
    bscTestnet: {
      accounts: {
        count: 10,
        mnemonic,
      },
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: chainIds.bscTestnet,
      // gasPrice: 20000000000,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      kovan: process.env.ETHERSCAN_API_KEY,
      // binance smart chain
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      // polygon
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
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
    // enabled by default
    // enabled: process.env.GAS ? true : false,
    currency: "USD",
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    // gasPrice: 22,
    coinmarketcap: process.env.CMC_API_KEY,
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
