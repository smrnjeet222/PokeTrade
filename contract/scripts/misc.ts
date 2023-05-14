import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";

async function main() {
  const [owner, admin] = await ethers.getSigners();

  const Cybergirl = await ethers.getContractFactory("Cybergirl");
  const contract = Cybergirl.attach(
    "0x75362d43640cfE536520448Ba2407aDA56CD64dc"
  );
  for (let i = 1; i <= 100; i++) {
    await contract.safeMint("0x8F41Fc0b93eFE33ef88072afC43d4f8285597362", `https://bafybeifzcb6wx22lkgfyswao7qvuaoytbo2avl76lfsj43pjrjfbn7qhaa.ipfs.nftstorage.link/${i}.json`)
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
