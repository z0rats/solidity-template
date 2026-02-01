import type { EthereumProvider } from "hardhat/types/providers";
import {
  encodePacked,
  keccak256,
  numberToHex,
  padHex,
  toHex,
  zeroAddress,
  zeroHash,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";

const zeroAddr = zeroAddress;

// AccessControl roles in bytes32 string
const roles = {
  admin: zeroHash, // DEFAULT_ADMIN_ROLE
  minter: keccak256(encodePacked(["string"], ["MINTER_ROLE"])),
  burner: keccak256(encodePacked(["string"], ["BURNER_ROLE"])),
};

const interfaceIds = {
  erc165: "0x01ffc9a7",
  ierc721: "0x80ac58cd",
  ierc721a: "0xc21b8f28",
  erc721metadata: "0x5b5e139f",
  erc721enumerable: "0x780e9d63",
};

const snapshot = {
  take: async (provider: EthereumProvider): Promise<string> =>
    (await provider.request({
      method: "evm_snapshot",
      params: [],
    })) as string,
  restore: async (provider: EthereumProvider, id: string) => {
    await provider.request({
      method: "evm_revert",
      params: [id],
    });
  },
};

// Returns current block timestamp (uses given provider; get it from (await network.connect()).provider)
const getCurrentTimestamp = async (provider: EthereumProvider): Promise<number> => {
  const blockNumberHex = (await provider.request({
    method: "eth_blockNumber",
    params: [],
  })) as Hex;
  const block = (await provider.request({
    method: "eth_getBlockByNumber",
    params: [blockNumberHex, false],
  })) as { timestamp: string };
  const ts = block.timestamp;
  return typeof ts === "string" && ts.startsWith("0x")
    ? Number(BigInt(ts))
    : Number(ts);
};

// `evm_increaseTime` receives a number of seconds that will be added to
// the timestamp of the latest block. `evm_mine` force a block to be mined.
const increaseTime = async (provider: EthereumProvider, seconds: number) => {
  await provider.request({
    method: "evm_increaseTime",
    params: [seconds],
  });
  await provider.request({ method: "evm_mine", params: [] });
};

// Wait `ms` before executing next line
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mineSingleBlock = async (provider: EthereumProvider) => {
  await provider.request({
    method: "hardhat_mine",
    params: [numberToHex(1)],
  });
};

const simulateNextBlockTime = async (
  provider: EthereumProvider,
  baseTime: bigint | number,
  changeBy: bigint,
) => {
  const bi = BigInt(baseTime);
  await provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [toHex(bi + changeBy)],
  });
  await mineSingleBlock(provider);
};

const toBytes32 = (value: bigint | number | Hex): Hex =>
  padHex(toHex(value), { size: 32 });

const setStorageAt = async (
  provider: EthereumProvider,
  address: string,
  index: string,
  value: Hex | string,
) => {
  await provider.request({
    method: "hardhat_setStorageAt",
    params: [address, index, value],
  });
  await provider.request({ method: "evm_mine", params: [] });
};

const randomSigners = (amount: number) =>
  Array.from({ length: amount }, () =>
    privateKeyToAccount(generatePrivateKey()),
  );

export {
  delay,
  getCurrentTimestamp,
  increaseTime,
  interfaceIds,
  randomSigners,
  roles,
  setStorageAt,
  simulateNextBlockTime,
  snapshot,
  toBytes32,
  zeroAddr,
};
