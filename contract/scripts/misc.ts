import { ethers, upgrades } from "hardhat";

async function main() {
  const [_owner, admin] = await ethers.getSigners();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
