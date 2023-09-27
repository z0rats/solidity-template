import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "@solarity/hardhat-markup";

import { HardhatUserConfig, NetworkUserConfig } from "hardhat/types";

import "./tasks/index.ts";

const chainIds = {
  ganache: 1337,
  hardhat: 31337,
  mainnet: 1,
  sepolia: 11155111,
  goerli: 5,
  mumbai: 80001,
  matic: 137,
};

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

const alchemyApiKey: string | undefined = process.env.ALCHEMY_API_KEY;
const alchemyPolygonKey: string | undefined = process.env.ALCHEMY_POLYGON_KEY;

function createNetworkConfig(
  network: keyof typeof chainIds
): NetworkUserConfig {
  let url: string;
  if (network === "mumbai")
    url = `https://polygon-${network}.g.alchemy.com/v2/${alchemyPolygonKey}`;
  else url = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;

  return {
    accounts: {
      count: 10,
      mnemonic,
    },
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
        version: "0.8.21",
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
    sepolia: createNetworkConfig("sepolia"),
    mumbai: createNetworkConfig("mumbai"),
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY as string,
      goerli: process.env.ETHERSCAN_API_KEY as string,
      sepolia: process.env.ETHERSCAN_API_KEY as string,
      // binance smart chain
      bsc: process.env.BSCSCAN_API_KEY as string,
      bscTestnet: process.env.BSCSCAN_API_KEY as string,
      // polygon
      polygon: process.env.POLYGONSCAN_API_KEY as string,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY as string,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
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
    // token: "ETH",
    // gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    token: "MATIC",
    gasPriceApi:
      "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    coinmarketcap: process.env.CMC_API_KEY,
  },
  markup: {
    outdir: "./docs",
    onlyFiles: ["./contracts"],
    skipFiles: [],
    noCompile: false,
    verbose: false,
  },
};

export default config;
