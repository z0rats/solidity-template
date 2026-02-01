import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Token1155Module", (m) => {
  const deployer = m.getAccount(0);
  const token1155 = m.contract("Token1155", [
    deployer,
    "Token1155",
    "TKN1155",
    "https://example.com/{id}.json",
  ]);

  m.call(token1155, "mintBatch", [
    deployer,
    [1n],
    [100n],
    "0x",
  ]);

  return { token1155 };
});
