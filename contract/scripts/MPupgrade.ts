import { ethers, upgrades } from "hardhat";

async function main() {
  const [_owner, admin] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("PokeMarketPlace");
  const PokeMarketPlace = await upgrades.deployProxy(factory, [[100, admin.address]]);
  await PokeMarketPlace.deployed();
  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
