import fs from "fs";
import dotenv from "dotenv";
import { task } from "hardhat/config";

task("revokeRole", "Revokes role from account")
  .addParam("role", "Available roles: 'minter', 'burner'. Minter by default")
  .addParam("from", "Address to revoke role from")
  .addOptionalParam(
    "token",
    "The address of the Token. By default grab it from .env"
  )
  .setAction(async (taskArgs, hre) => {
    const roles = {
      minter: hre.ethers.solidityPackedKeccak256(["string"], ["MINTER_ROLE"]),
      burner: hre.ethers.solidityPackedKeccak256(["string"], ["BURNER_ROLE"]),
    };

    const network = hre.network.name;
    const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`));
    for (const parameter in envConfig) {
      process.env[parameter] = envConfig[parameter];
    }

    const token = await hre.ethers.getContractAt(
      process.env.TOKEN_NAME as string,
      taskArgs.token || (process.env.ASSET20_TOKEN_ADDRESS as string)
    );

    const role = taskArgs.role === "burner" ? roles.burner : roles.minter;

    console.log(`\nRevoking role ${role} from ${taskArgs.from}...\n`);
    await token.revokeRole(role, taskArgs.from);
    console.log(`✅ Tx sent!`);
  });
