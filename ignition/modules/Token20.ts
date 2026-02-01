import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Token20Module", (m) => {
  const deployer = m.getAccount(0);
  const token20 = m.contract("Token20", ["Token20", "TKN"]);

  m.call(token20, "mint", [deployer, 1000n]);

  return { token20 };
});
