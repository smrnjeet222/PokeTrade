import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, admin] = await ethers.getSigners();
  console.log("Owner => ", owner.address);
  console.log("Admin => ", admin.address);


  const factory = await ethers.getContractFactory("PokeMarketPlace");

  const PokeMarketPlace = await upgrades.deployProxy(factory, [0]); // 0.00% fee

  await PokeMarketPlace.deployed();

  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);
  // 0x5c8235448844795153373bCb454E809d85f8411a

  // implementation: 0xd630F9Ae4eF22DEa4bdaC8CefC062F7E859aC55a
  // proxy: 0x5c8235448844795153373bCb454E809d85f8411a

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
