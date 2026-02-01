import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Token721Module", (m) => {
  const deployer = m.getAccount(0);
  const token721 = m.contract("Token721", ["Token721", "TKN721", deployer]);

  m.call(token721, "safeMint", [deployer, 1n]);

  return { token721 };
});
