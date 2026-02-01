import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";

/** Task takes no arguments. */
type AccountsTaskArguments = Record<string, never>;

export default async function (
  _taskArgs: AccountsTaskArguments,
  hre: HardhatRuntimeEnvironment,
): Promise<void> {
  const connection = await hre.network.connect();
  const { viem } = connection as unknown as { viem: { getWalletClients: () => Promise<Array<{ account: { address: string } }>> } };
  const walletClients = await viem.getWalletClients();
  const addresses = walletClients.map((wc) => wc.account.address);
  console.log("Accounts:", addresses);
}
