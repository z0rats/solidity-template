# Sample Hardhat 3 Beta Project (`node:test` and `viem`)

This project showcases a Hardhat 3 Beta project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about the Hardhat 3 Beta, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join the [Hardhat 3 Beta](https://hardhat.org/hardhat3-beta-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new).

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests in `contracts/tests/`.
- TypeScript integration tests using [`node:test`](https://nodejs.org/api/test.html) and [viem](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.
- CI workflows: lint, test, coverage, and Slither static analysis.

## Prerequisites

- Node.js 24+
- [pnpm](https://pnpm.io/) 9+

## Install

```bash
pnpm install
```

## Usage

### Lint

```bash
pnpm lint
```

### Running Tests

Run all tests (Solidity and Node.js):

```bash
pnpm test
```

Run only Solidity tests:

```bash
pnpm exec hardhat test solidity
```

Run only Node.js tests:

```bash
pnpm exec hardhat test nodejs
```

Run tests matching a pattern:

```bash
pnpm exec hardhat test solidity --grep "Token20"
pnpm exec hardhat test nodejs --test-name-pattern "Token20"
```

### Coverage

```bash
pnpm coverage
```

Runs the full test suite. For detailed Solidity coverage reports you can add a coverage plugin (e.g. `solidity-coverage`).

### Environment and Secrets

For deployment and scripts that need private keys or RPC URLs, use [Hardhat Configuration Variables](https://hardhat.org/docs/advanced/config-variables) or environment variables.

**Using Hardhat Keystore (recommended for local dev):**

```bash
pnpm exec hardhat keystore set SEPOLIA_PRIVATE_KEY
pnpm exec hardhat keystore set SEPOLIA_RPC_URL
```

**Using environment variables:**

Export before running commands, or use a `.env` file (do not commit secrets):

```bash
export SEPOLIA_PRIVATE_KEY=0x...
export SEPOLIA_RPC_URL=https://...
```

The config expects:

- `SEPOLIA_PRIVATE_KEY` – account used for deployment/transactions on Sepolia.
- `SEPOLIA_RPC_URL` – Sepolia RPC endpoint (optional if using a default).

### Compile

```bash
pnpm exec hardhat compile
```

### Deployment

Deploy to a **local** simulated chain:

```bash
pnpm exec hardhat ignition deploy ignition/modules/Counter.ts
pnpm exec hardhat ignition deploy ignition/modules/Token20.ts
pnpm exec hardhat ignition deploy ignition/modules/Token721.ts
pnpm exec hardhat ignition deploy ignition/modules/Token1155.ts
```

Deploy to **Sepolia** (account must have funds and config/keystore set):

```bash
pnpm exec hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
pnpm exec hardhat ignition deploy --network sepolia ignition/modules/Token20.ts
# ... same for Token721, Token1155
```

Set the deployer key via keystore or env (see [Environment and Secrets](#environment-and-secrets)) before running.

### CI

- **Lint:** `pnpm lint`
- **Test:** `pnpm test`
- **Coverage:** `pnpm coverage`
- **Slither:** see [.github/workflows/slither.yaml](.github/workflows/slither.yaml) – runs on push/PR, compiles with `hardhat-ci.config.ts`, uploads SARIF.

## Contract and Test Layout

- **Contracts:** `contracts/` (e.g. `Counter.sol`, `Token20.sol`, `Token721.sol`, `Token1155.sol`).
- **Solidity tests:** `contracts/tests/` (`Token20.t.sol`, `Token721.t.sol`, `Token1155.t.sol`) and `contracts/Counter.t.sol`.
- **Node.js tests:** `test/*.ts`.
- **Deployment modules:** `ignition/modules/*.ts`.
