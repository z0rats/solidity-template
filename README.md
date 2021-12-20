# Solidity project template

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Requires `.env` file with:
- ALCHEMY_URL
- ETHERSCAN_API_KEY
- CMC_API_KEY
- MNEMONIC
- ALCHEMY_URL

`.env-<network_name>` with:
- TOKEN_NAME
- TOKEN_SYMBOL
- TOKEN_DECIMALS
- TOKEN_MINT

Try running some of the following tasks:

```shell
npx hardhat coverage
npx hardhat test test/token.test.ts
GAS=true npx hardhat test test/token.test.ts
npx hardhat accounts
npx hardhat run scripts/deploy.ts --network rinkeby
npx hardhat token-balance --account <addrs> --network rinkeby
```