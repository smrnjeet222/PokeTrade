import { ethers, upgrades } from "hardhat";

async function main() {
  const [admin, owner] = await ethers.getSigners();

  const factory = await ethers.getContractFactory("PokeMarketPlace");

  const PokeMarketPlace = await upgrades.deployProxy(factory, [100, admin.address]); // 0.01% fee

  await PokeMarketPlace.deployed();

  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);
  // 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
