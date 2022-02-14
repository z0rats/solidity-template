import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";

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
  erc721: "0x80ac58cd",
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
  (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

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

export {
  zeroAddr,
  roles,
  interfaceIds,
  snapshot,
  getCurrentTimestamp,
  increaseTime,
  bigSqrt,
};
