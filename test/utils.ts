import { ethers, network } from "hardhat";

const ONE = ethers.constants.One;
const TWO = ethers.constants.Two;
const zeroAddr = ethers.constants.AddressZero;

// AccessControl roles in bytes32 string
const roles = {
  admin: ethers.constants.HashZero, // DEFAULT_ADMIN_ROLE
  minter: ethers.utils.solidityKeccak256(["string"], ["MINTER_ROLE"]),
  burner: ethers.utils.solidityKeccak256(["string"], ["BURNER_ROLE"]),
};

const interfaceIds = {
  erc165: "0x01ffc9a7",
  ierc721: "0x80ac58cd",
  ierc721a: "0xc21b8f28",
  erc721metadata: "0x5b5e139f",
  erc721enumerable: "0x780e9d63",
};

const snapshot = {
  take: async (): Promise<any> => {
    return await network.provider.request({
      method: "evm_snapshot",
      params: [],
    });
  },
  restore: async (id: string) => {
    await network.provider.request({
      method: "evm_revert",
      params: [id],
    });
  },
};

// Returns current block timestamp
const getCurrentTimestamp = async () =>
  (await ethers.provider.getBlock(await ethers.provider.getBlockNumber()))
    .timestamp;

// `evm_increaseTime` receives a number of seconds that will be added to
// the timestamp of the latest block. `evm_mine` force a block to be mined.
const increaseTime = async (seconds: number) => {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
};

// Computes square root of BigNumber value type
const bigSqrt = (value: BigNumber) => {
  const x = ethers.BigNumber.from(value);
  let z = x.add(ONE).div(TWO);
  let y = x;
  while (z.sub(y).isNegative()) {
    y = z;
    z = x.div(z).add(z).div(TWO);
  }
  return y;
};

// Wait `ms` before executing next line
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mineSingleBlock = async () => {
  await network.provider.send("hardhat_mine", [
    ethers.utils.hexValue(1).toString(),
  ]);
};

const simulateNextBlockTime = async (baseTime: any, changeBy: number) => {
  const bi = ethers.BigNumber.from(baseTime);
  await network.provider.send("evm_setNextBlockTimestamp", [
    ethers.utils.hexlify(bi.add(changeBy)),
  ]);
  await mineSingleBlock();
};

const toBytes32 = (bn: any) => {
  return ethers.utils.hexlify(ethers.utils.zeroPad(bn.toHexString(), 32));
};

const setStorageAt = async (address: string, index: string, value: any) => {
  await ethers.provider.send("hardhat_setStorageAt", [address, index, value]);
  await ethers.provider.send("evm_mine", []); // Just mines to the next block
};

const randomSigners = (amount: number) => {
  const signers = [];
  for (let i = 0; i < amount; i++) {
    signers.push(ethers.Wallet.createRandom());
  }
  return signers;
};

export {
  zeroAddr,
  roles,
  interfaceIds,
  snapshot,
  getCurrentTimestamp,
  increaseTime,
  bigSqrt,
  delay,
  simulateNextBlockTime,
  toBytes32,
  setStorageAt,
  randomSigners,
};
