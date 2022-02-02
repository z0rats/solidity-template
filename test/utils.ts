import { ethers, network } from "hardhat";

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

const getCurrentTimestamp = async () =>
  (await ethers.provider.getBlock(await ethers.provider.getBlockNumber())).timestamp;

export { zeroAddr, roles, interfaceIds, snapshot, getCurrentTimestamp };
