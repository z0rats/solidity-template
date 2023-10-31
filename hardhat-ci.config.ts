import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";

import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.22",
  },
  defaultNetwork: "hardhat",
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
    enabled: !!process.env.REPORT_GAS,
    currency: "USD",
  },
};

export default config;
