import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

interface TokenBalanceTaskArguments {
  account: string;
}

export default async function (
  taskArgs: TokenBalanceTaskArguments,
  hre: HardhatRuntimeEnvironment,
): Promise<void> {
  const tokenAddress = process.env.TOKEN20_ADDRESS;
  if (!tokenAddress) {
    throw new Error("TOKEN20_ADDRESS is not set in environment");
  }
  const connection = await hre.network.connect();
  const { viem } = connection as unknown as {
    viem: {
      getContractAt: (name: string, address: string) => Promise<{ read: { balanceOf: (args: [string]) => Promise<bigint> } }>;
    };
  };
  const account = taskArgs.account;
  const token = await viem.getContractAt("Token20", tokenAddress);
  const balance = await token.read.balanceOf([account]);
  console.log(`Token20 balance for ${account}:`, balance.toString());
}
