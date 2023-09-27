import fs from "fs";
import dotenv from "dotenv";
import hre from "hardhat";
import { HardhatEthersSigner } from "@nomiclabs/hardhat-ethers/signers";

const network = hre.network.name;
const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`));
for (const parameter in envConfig) {
  process.env[parameter] = envConfig[parameter];
}

async function main() {
  const [alice, bob]: HardhatEthersSigner[] = await hre.ethers.getSigners();
  console.log("Sender address: ", alice.address);

  const balance = await alice.getBalance();
  console.log(
    `Sender balance: ${hre.ethers.formatEther(balance).toString()}`
  );

  const gasPrice = await hre.network.provider.send("eth_gasPrice");
  console.log(
    `gasPrice: ${hre.ethers.formatEther(gasPrice).toString()} eth`
  );

  const tx = {
    from: alice.address,
    to: bob.address,
    value: hre.ethers.parseUnits("0.00001", "ether"),
    // gasPrice: custom,
    gasPrice,
    gasLimit: hre.ethers.utils.hexlify(100000), // 100 gwei
    nonce: await hre.network.provider.send("eth_getTransactionCount", [
      alice.address,
    ]),
    // nonce: custom,
  };

  const transaction = await alice.sendTransaction(tx);

  console.log(transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
