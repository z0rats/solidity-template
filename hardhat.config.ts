import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatMarkupPlugin from "@solarity/hardhat-markup";
import hardhatAbiExporterPlugin from "@solidstate/hardhat-abi-exporter";
import { configVariable, defineConfig, task } from "hardhat/config";
import { ArgumentType } from "hardhat/types/arguments";

const accountsTask = task("accounts", "Print all account addresses")
  .setAction(() => import("./tasks/accounts.js"))
  .build();

const tokenBalanceTask = task(
  "token-balance",
  "Check ERC20 balance for an account (reads TOKEN20_ADDRESS from env)",
)
  .addPositionalArgument({
    name: "account",
    description: "Account address to check balance for",
    type: ArgumentType.STRING,
  })
  .setAction(() => import("./tasks/token-balance.js"))
  .build();

export default defineConfig({
  tasks: [accountsTask, tokenBalanceTask],
  plugins: [
    hardhatToolboxViemPlugin,
    hardhatMarkupPlugin,
    hardhatAbiExporterPlugin,
  ],
  abiExporter: {
    path: './abi',
    runOnCompile: true,
    clear: true,
    flat: false,
    only: [],
    spacing: 2,
    pretty: true,
  },
  paths: {
    tests: {
      solidity: "./contracts/tests",
    },
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.33",
      },
      production: {
        version: "0.8.33",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    }
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});
