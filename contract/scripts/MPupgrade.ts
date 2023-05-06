import { ethers, upgrades } from "hardhat";
import MarketPlaceUpgradable from "../artifacts/contracts/lib/proxy/MarketPlaceUpgradeable.sol/MarketPlaceUpgradeableProxy.json"

async function main() {
  const factory = await ethers.getContractFactory("PokeMarketPlace");
  const PokeMarketPlace = await factory.deploy();
  await PokeMarketPlace.deployed();

  const [admin, owner] = await ethers.getSigners();

  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);

  // let upgrade = await upgrades.upgradeProxy("0x3b90c0bd38f22f78d0e575E39cF6C7b01b116884", factory);

  const upgradableContract = new ethers.Contract("0x3b90c0bd38f22f78d0e575E39cF6C7b01b116884", MarketPlaceUpgradable.abi, admin);

  // console.log(upgradableContract);

  await upgradableContract.connect(owner).upgradeTo("0xF2df2375707b9cC1502833b4a23c9A2734c58ACE");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});