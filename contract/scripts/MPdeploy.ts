import { ethers } from "hardhat";

async function main() {
  const factory = await ethers.getContractFactory("PokeMarketPlace");
  const PokeMarketPlace = await factory.deploy();
  await PokeMarketPlace.deployed();

  const pokeMarketProxy = await ethers.getContractFactory("MarketPlaceUpgradeableProxy");
  const [admin, owner] = await ethers.getSigners();

  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);

  const vaultInterface = new ethers.utils.Interface([
      "function initialize( uint256 _platformFees, address _admin) external"
  ])

  let data = vaultInterface.encodeFunctionData("initialize", [ 100, admin.address]);
  console.log(PokeMarketPlace.address, owner.address, data);
  const pokeProxy = await pokeMarketProxy.deploy(PokeMarketPlace.address, owner.address, data);
  await pokeProxy.deployed();


  console.log("Proxy deployed to:", pokeProxy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
