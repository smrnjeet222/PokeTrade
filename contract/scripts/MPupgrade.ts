import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, admin] = await ethers.getSigners();
  console.log("Owner => ", owner.address);
  console.log("Admin => ", admin.address);
  const factory = await ethers.getContractFactory("PokeMarketPlace");
  const PokeMarketPlace = await upgrades.upgradeProxy("0x5c8235448844795153373bCb454E809d85f8411a", factory);
  await PokeMarketPlace.deployed();
  console.log("PokeMarketPlace deployed to:", PokeMarketPlace.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// import { run } from "hardhat"

// async function verify(contractAddress: string, args: never[]) {
//     try {
//         await run("verify:verify", {
//             address: contractAddress,
//             constructorArgument: args,
//         })
//     } catch (e) {
//         console.log(e)
//     }
// }

// verify("0x8D4130F21bEc854182BeF4AE70CcF0F906Ee58B9", [])