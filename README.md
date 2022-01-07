# Solidity project template

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a simple ERC-20 token implementation and AccessControl with minter & burner roles. There are also tests, deploy script and CI config.

### How to run

Create a `.env` file using the `.env.example` template with the following content
- [ALCHEMY_API_KEY](https://www.alchemy.com/)
- [POLYGONSCAN_API_KEY](https://polygonscan.com/apis)
- [CMC_API_KEY](https://coinmarketcap.com/api/)
- [BSCSCAN_API_KEY](https://bscscan.com/apis)
- [ETHERSCAN_API_KEY](https://etherscan.io/apis)
- [MNEMONIC](https://docs.metamask.io/guide/common-terms.html#mnemonic-phrase-seed-phrase-seed-words)

Try running some of the following tasks and don't forget to specify network (ex. `--network mumbai`):

* `hh` is a [shorthand](https://hardhat.org/guides/shorthand.html) for `npx hardhat`

```shell
hh run scripts/deploy.ts --network mumbai

hh coverage
hh test test/token.test.ts
GAS=true hh test test/token.test.ts

hh accounts
hh token-balance --account <addrs> --network mumbai
```