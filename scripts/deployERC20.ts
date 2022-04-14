import fs from "fs";
import dotenv from "dotenv";
import hre, { artifacts, run } from "hardhat";
import path from "path";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { Token__factory } from "../types";

const network = hre.network.name;
const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`));
for (const parameter in envConfig) {
  process.env[parameter] = envConfig[parameter];
}

async function main() {
  const [owner]: SignerWithAddress[] = await hre.ethers.getSigners();
  console.log("Sender address: ", owner.address);

  const balance = await owner.getBalance();
  console.log(`Sender balance: ${hre.ethers.utils.formatEther(balance).toString()}`);

  const gasPrice = await hre.network.provider.send("eth_gasPrice");
  console.log(`gasPrice: ${hre.ethers.utils.formatEther(gasPrice).toString()} eth`);

  const token = await new Token__factory(owner).deploy(
    process.env.TOKEN_NAME_FULL as string,
    process.env.TOKEN_SYMBOL as string
  );

  await token.deployed();
  console.log(`ERC20 token deployed to ${token.address}`);

  // Sync env file
  fs.appendFileSync(
    `.env-${network}`,
    `\r\# Deployed at \rTOKEN_ADDRESS=${token.address}\r`
  );

  // Verifying contract
  console.log("Verifying...");
  await run("verify:verify", {
    address: token.address,
    contract: "contracts/ERC20.sol:Token",
    constructorArguments: [process.env.TOKEN_NAME_FULL, process.env.TOKEN_SYMBOL]
  });

  // Saving artifacts and address in `/frontend`
  // saveFrontendFiles();
}

// NOTE: Below script can be used to save artifacts and deploy addresses in some
// other folder, for example `/frontend` or `/backend`
const saveFrontendFiles = () => {
  const contractsDir = path.join(__dirname, "/../frontend/src/contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const Artifact = artifacts.readArtifactSync(process.env.TOKEN_NAME as string);

  fs.writeFileSync(
    path.join(contractsDir, `/${process.env.TOKEN_NAME}.json`),
    JSON.stringify(Artifact, null, 2)
  );
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
