const hre = require("hardhat");
async function main() {
  const Token = await hre.ethers.deployContract("Token");

  await Token.waitForDeployment();
  console.log(`Token Deployed at ${await Token.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
