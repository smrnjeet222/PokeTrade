import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, admin] = await ethers.getSigners();
  console.log("Owner => ", owner.address);
  console.log("Admin => ", admin.address);


  const factory = await ethers.getContractFactory("PokeMarketPlace");

  const PokeMarketPlace = await upgrades.deployProxy(factory, [0, admin.address]); // 0.00% fee

  await PokeMarketPlace.deployed();

  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);
  // 0xFaAad54447612ae63C5f60140Be9FD7D961e57A1

  // implementation: 0xF48Fd17433648C7c9021B71E392aBfE46f539113
  // proxy: 0xFaAad54447612ae63C5f60140Be9FD7D961e57A1

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
