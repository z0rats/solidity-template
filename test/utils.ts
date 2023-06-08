import { ethers, network } from "hardhat";

const zeroAddr = ethers.ZeroAddress;

// AccessControl roles in bytes32 string
const roles = {
  admin: ethers.ZeroHash, // DEFAULT_ADMIN_ROLE
  minter: ethers.solidityPackedKeccak256(["string"], ["MINTER_ROLE"]),
  burner: ethers.solidityPackedKeccak256(["string"], ["BURNER_ROLE"]),
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

// Wait `ms` before executing next line
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mineSingleBlock = async () => {
  await network.provider.send("hardhat_mine", [
    ethers.toQuantity(1).toString(),
  ]);
};

const simulateNextBlockTime = async (baseTime: any, changeBy: BigInt) => {
  const bi = BigInt(baseTime);
  await network.provider.send("evm_setNextBlockTimestamp", [
    ethers.toBeHex(bi + changeBy),
  ]);
  await mineSingleBlock();
};

const toBytes32 = (bn: any) => {
  return ethers.toBeHex(ethers.zeroPadValue(bn.toHexString(), 32));
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
  delay,
  simulateNextBlockTime,
  toBytes32,
  setStorageAt,
  randomSigners,
};
