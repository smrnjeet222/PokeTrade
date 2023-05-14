import { expect } from "chai";
import { ethers } from "hardhat";
import { PokeCardERC1155, PokeMarketPlace, PokeCardERC721 } from "../typechain-types";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const NativeAddress = "0x0000000000000000000000000000000000000000";

describe("marketPlace", function () {
  let PokeCardERC1155: PokeCardERC1155, PokeCardERC721: PokeCardERC721, PokeMarketPlace: PokeMarketPlace, erc20TestToken: Contract, orderId: string;
  let [owner, seller1, seller2, buyer1, buyer2, bidder1, bidder2]: SignerWithAddress[] = []
  // runs once before the first test in this block
  before(async function () {
    [owner, seller1, seller2, buyer1, buyer2, bidder1, bidder2] = await ethers.getSigners();
    // ERC20
    const factory_ERC20 = await ethers.getContractFactory("MyToken");
    erc20TestToken = await factory_ERC20.deploy("Test Token for test", "TTT", 18);
    await erc20TestToken.deployed();
    // ERC1155
    const factory_ERC1155 = await ethers.getContractFactory("PokeCardERC1155");
    PokeCardERC1155 = await factory_ERC1155.deploy();
    await PokeCardERC1155.deployed();
    // ERC721
    const factory_ERC721 = await ethers.getContractFactory("PokeCardERC721");
    PokeCardERC721 = await factory_ERC721.deploy();
    await PokeCardERC721.deployed();
    // MP
    const factory_MP = await ethers.getContractFactory("PokeMarketPlace");
    PokeMarketPlace = await factory_MP.deploy();
    await PokeMarketPlace.deployed();
    const iniTx = await PokeMarketPlace.initialize(0, owner.address);
    await iniTx.wait();
    //  Add Support 
    await PokeCardERC721.setApprovalForAll(PokeMarketPlace.address, true);
    await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, true);

    await PokeMarketPlace.addNftContractSupport(PokeCardERC721.address);
    await PokeMarketPlace.addNftContractSupport(PokeCardERC1155.address);
    await PokeMarketPlace.addTokenSupport(erc20TestToken.address);

    expect(await PokeMarketPlace.nftContracts(PokeCardERC721.address)).to.equal(true);
    expect(await PokeMarketPlace.nftContracts(PokeCardERC1155.address)).to.equal(true);
    expect(await PokeMarketPlace.tokensSupport(erc20TestToken.address)).to.equal(true);
  });

  describe('SaleType - BuyNow', function () {
    it("Cancel Order", async function () {
      await PokeCardERC721.safeMint(seller1.address, 0);  // #0
      (await PokeCardERC721.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true)).wait()
      const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(
        0,
        PokeCardERC721.address,
        0,
        ethers.utils.parseEther("1.2"),
        NativeAddress,
        0,
        0
      );
      const receipt = await tx.wait();
      const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
      const data = receipt.logs[1].data;
      const topics = receipt.logs[1].topics;
      const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
      expect(event.seller).to.equal(seller1.address);
      expect(event.price).to.equal(ethers.utils.parseEther("1.2"));
      expect(event.endTime).to.equal(0);

      const orderInfo = await PokeMarketPlace.order(event.orderId);
      console.log(orderInfo);

      expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(1)
      expect(await PokeCardERC721.balanceOf(seller1.address)).to.equal(0)

      const _cancel_tx = (await PokeMarketPlace.connect(seller1).cancelOrder(event.orderId)).wait()

      expect((await PokeMarketPlace.order(event.orderId)).nftContract).to.equal("0x0000000000000000000000000000000000000000")
      expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(0)
      expect(await PokeCardERC721.balanceOf(seller1.address)).to.equal(1)
    });
    describe('ERC721', function () {
      describe('Native Token', function () {
        it("BUYYYY", async function () {
          await PokeCardERC721.safeMint(seller1.address, 1);  // #1
          (await PokeCardERC721.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true)).wait()
          const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(
            1,
            PokeCardERC721.address,
            0,
            ethers.utils.parseEther("1.2"),
            NativeAddress,
            0,
            0
          );
          const receipt = await tx.wait();
          const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
          const data = receipt.logs[1].data;
          const topics = receipt.logs[1].topics;
          const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
          expect(event.seller).to.equal(seller1.address);
          expect(event.price).to.equal(ethers.utils.parseEther("1.2"));
          expect(event.endTime).to.equal(0);

          const orderInfo = await PokeMarketPlace.order(event.orderId);
          console.log(orderInfo);

          const balance = await PokeCardERC721.balanceOf(PokeMarketPlace.address);
          expect(balance).to.equal(1)

          const buy_tx = await PokeMarketPlace.connect(buyer1).buyNow(event.orderId, 0, {
            value: ethers.utils.parseEther("1.2")
          });
          const buy_receipt = await buy_tx.wait();
          const buy_interfaceTx = new ethers.utils.Interface(["event OrderPurchased(uint256 indexed orderId, address buyer, uint16 copies);"]);
          const buy_data = buy_receipt.logs[1].data;
          const buy_topics = buy_receipt.logs[1].topics;
          const buy_event = buy_interfaceTx.decodeEventLog("OrderPurchased", buy_data, buy_topics);
          expect(buy_event.orderId).to.equal(event.orderId);
          expect(buy_event.buyer).to.equal(buyer1.address);

          const afterbuy_orderInfo = await PokeMarketPlace.order(event.orderId);
          // console.log(afterbuy_orderInfo)
          expect(afterbuy_orderInfo.nftContract).to.equal("0x0000000000000000000000000000000000000000")
          expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(0)
          expect(await PokeCardERC721.balanceOf(buyer1.address)).to.equal(1)
        });
      });
      describe('ERC20 Token', function () {
        it("BUYYYY", async function () {
          await PokeCardERC721.safeMint(seller1.address, 2);  // #2
          (await PokeCardERC721.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true)).wait()
          const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(
            2,
            PokeCardERC721.address,
            0,
            ethers.utils.parseEther("0.5"),
            erc20TestToken.address,
            0,
            0
          );
          const receipt = await tx.wait();
          const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
          const data = receipt.logs[1].data;
          const topics = receipt.logs[1].topics;
          const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
          expect(event.seller).to.equal(seller1.address);
          expect(event.paymentToken).to.equal(erc20TestToken.address);
          expect(event.price).to.equal(ethers.utils.parseEther("0.5"));
          expect(event.endTime).to.equal(0);

          const orderInfo = await PokeMarketPlace.order(event.orderId);
          console.log(orderInfo);

          const balance = await PokeCardERC721.balanceOf(PokeMarketPlace.address);
          expect(balance).to.equal(1)

          const _mintingToken = (await erc20TestToken.connect(buyer1).mint(ethers.utils.parseEther("0.6"))).wait()
          const _approving = (await erc20TestToken.connect(buyer1).approve(PokeMarketPlace.address, ethers.utils.parseEther("0.5"))).wait()
          const buy_tx = await PokeMarketPlace.connect(buyer1).buyNow(event.orderId, 0);
          const buy_receipt = await buy_tx.wait();
          const buy_interfaceTx = new ethers.utils.Interface(["event OrderPurchased(uint256 indexed orderId, address buyer, uint16 copies);"]);
          const buy_data = buy_receipt.logs[4].data;
          const buy_topics = buy_receipt.logs[4].topics;
          const buy_event = buy_interfaceTx.decodeEventLog("OrderPurchased", buy_data, buy_topics);
          expect(buy_event.orderId).to.equal(event.orderId);
          expect(buy_event.buyer).to.equal(buyer1.address);

          const afterbuy_orderInfo = await PokeMarketPlace.order(event.orderId);
          // console.log(afterbuy_orderInfo)
          expect(afterbuy_orderInfo.nftContract).to.equal("0x0000000000000000000000000000000000000000")
          expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(0)
          expect(await PokeCardERC721.balanceOf(buyer1.address)).to.equal(2)
          expect(await erc20TestToken.balanceOf(buyer1.address)).to.equal(ethers.utils.parseEther("0.1"))
          expect(await erc20TestToken.balanceOf(seller1.address)).to.equal(ethers.utils.parseEther("0.5"))
        });
      });
    });
  });
  describe('SaleType - OpenForOffers', function () {
    it.skip("Cancel Order", async function () { })
    describe('ERC721', function () {
      describe('Native Token', function () {
        it("check Bidding - and accept", async function () {
          await PokeCardERC721.safeMint(seller1.address, 4);  // #4
          (await PokeCardERC721.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true)).wait()
          const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(
            4,
            PokeCardERC721.address,
            0,
            ethers.utils.parseEther("0.9"),
            NativeAddress,
            new Date().getTime() + 86400000 / 100,
            1
          );
          const receipt = await tx.wait();
          const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
          const data = receipt.logs[1].data;
          const topics = receipt.logs[1].topics;
          const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
          expect(event.seller).to.equal(seller1.address);
          expect(event.price).to.equal(ethers.utils.parseEther("0.9"));

          const orderInfo = await PokeMarketPlace.order(event.orderId);
          console.log("ORDER INFO _>", orderInfo);

          const balance = await PokeCardERC721.balanceOf(PokeMarketPlace.address);
          expect(balance).to.equal(1)

          const bid2_tx = await PokeMarketPlace.connect(bidder2).placeOfferForOrder(event.orderId, 0,
            ethers.utils.parseEther("1.1"),
            {
              value: ethers.utils.parseEther("1.1")
            }
          );
          const bid2_receipt = await bid2_tx.wait();
          const bid_tx = await PokeMarketPlace.connect(bidder1).placeOfferForOrder(event.orderId, 0,
            ethers.utils.parseEther("1"),
            {
              value: ethers.utils.parseEther("1")
            }
          );
          const bid_receipt = await bid_tx.wait();
          const bid_interfaceTx = new ethers.utils.Interface(["event BidPlaced(uint256 indexed orderId, uint256 bidIndex, address bidder, uint16 copies, uint256 pricePerNft, uint256 bidTime);"]);
          const bid_data = bid_receipt.logs[0].data;
          const bid_topics = bid_receipt.logs[0].topics;
          const bid_event = bid_interfaceTx.decodeEventLog("BidPlaced", bid_data, bid_topics);

          expect(bid_event.orderId).to.equal(event.orderId);
          expect(bid_event.bidder).to.equal(bidder1.address);
          expect(bid_event.pricePerNft).to.equal(ethers.utils.parseEther("1"));

          const bidder2_balance_before_accept = await ethers.provider.getBalance(bidder2.address)

          const accept_tx = await PokeMarketPlace.connect(seller1).acceptBid(bid_event.orderId, bid_event.bidIndex)
          const accept_receipt = await accept_tx.wait();
          // const accept_interfaceTx = new ethers.utils.Interface(["event BidAccepted(uint256 indexed orderId, uint256 bidId, uint16 copies);"]);
          // const accept_data = accept_receipt.logs[2].data;
          // const accept_topics = accept_receipt.logs[2].topics;
          // const accept_event = accept_interfaceTx.decodeEventLog("BidAccepted", accept_data, accept_topics);

          const bidder2_balance_after_accept = await ethers.provider.getBalance(bidder2.address)

          const afterbuy_orderInfo = await PokeMarketPlace.order(event.orderId);
          // console.log(afterbuy_orderInfo)
          expect(afterbuy_orderInfo.nftContract).to.equal("0x0000000000000000000000000000000000000000")
          expect(bidder2_balance_after_accept.sub(bidder2_balance_before_accept)).to.equal(ethers.utils.parseEther("1.1"))
          expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(0)
          expect(await PokeCardERC721.balanceOf(bidder1.address)).to.equal(1)
        });
      });
      describe('ERC20 Token', function () {
        it("check Bidding - and accept", async function () {
          await PokeCardERC721.safeMint(seller1.address, 5);  // #5
          (await PokeCardERC721.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true)).wait()
          const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(
            5,
            PokeCardERC721.address,
            0,
            ethers.utils.parseEther("0.5"),
            erc20TestToken.address,
            new Date().getTime() + 86400000 / 100,
            1
          );
          const receipt = await tx.wait();
          const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
          const data = receipt.logs[1].data;
          const topics = receipt.logs[1].topics;
          const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
          expect(event.seller).to.equal(seller1.address);
          expect(event.paymentToken).to.equal(erc20TestToken.address);
          expect(event.price).to.equal(ethers.utils.parseEther("0.5"));

          const orderInfo = await PokeMarketPlace.order(event.orderId);
          console.log(orderInfo);

          const balance = await PokeCardERC721.balanceOf(PokeMarketPlace.address);
          expect(balance).to.equal(1)

          const _mintingToken2 = (await erc20TestToken.connect(bidder2).mint(ethers.utils.parseEther("2"))).wait()
          const _approving2 = (await erc20TestToken.connect(bidder2).approve(PokeMarketPlace.address, ethers.utils.parseEther("0.6"))).wait()
          const bid2_tx = await PokeMarketPlace.connect(bidder2).placeOfferForOrder(event.orderId, 0,
            ethers.utils.parseEther("0.6")
          );
          const bid2_receipt = await bid2_tx.wait();
          expect(await erc20TestToken.balanceOf(bidder2.address)).to.equal(ethers.utils.parseEther("1.4"))
          expect(await erc20TestToken.balanceOf(PokeMarketPlace.address)).to.equal(ethers.utils.parseEther("0.6"))

          const _mintingToken = (await erc20TestToken.connect(bidder1).mint(ethers.utils.parseEther("2"))).wait()
          const _approving = (await erc20TestToken.connect(bidder1).approve(PokeMarketPlace.address, ethers.utils.parseEther("0.8"))).wait()
          const bid_tx = await PokeMarketPlace.connect(bidder1).placeOfferForOrder(event.orderId, 0,
            ethers.utils.parseEther("0.8")
          );
          const bid_receipt = await bid_tx.wait();
          expect(await erc20TestToken.balanceOf(bidder1.address)).to.equal(ethers.utils.parseEther("1.2"))
          expect(await erc20TestToken.balanceOf(PokeMarketPlace.address)).to.equal(ethers.utils.parseEther("1.4"))
          const bid_interfaceTx = new ethers.utils.Interface(["event BidPlaced(uint256 indexed orderId, uint256 bidIndex, address bidder, uint16 copies, uint256 pricePerNft, uint256 bidTime);"]);
          const bid_data = bid_receipt.logs[2].data;
          const bid_topics = bid_receipt.logs[2].topics;
          const bid_event = bid_interfaceTx.decodeEventLog("BidPlaced", bid_data, bid_topics);

          expect(bid_event.orderId).to.equal(event.orderId);
          expect(bid_event.bidder).to.equal(bidder1.address);
          expect(bid_event.pricePerNft).to.equal(ethers.utils.parseEther("0.8"));

          const accept_tx = await PokeMarketPlace.connect(seller1).acceptBid(bid_event.orderId, bid_event.bidIndex)
          const accept_receipt = await accept_tx.wait();
          // const accept_interfaceTx = new ethers.utils.Interface(["event BidAccepted(uint256 indexed orderId, uint256 bidId, uint16 copies);"]);
          // const accept_data = accept_receipt.logs[2].data;
          // const accept_topics = accept_receipt.logs[2].topics;
          // const accept_event = accept_interfaceTx.decodeEventLog("BidAccepted", accept_data, accept_topics);


          const afterbuy_orderInfo = await PokeMarketPlace.order(event.orderId);
          // console.log(afterbuy_orderInfo)
          expect(afterbuy_orderInfo.nftContract).to.equal("0x0000000000000000000000000000000000000000")
          expect(await erc20TestToken.balanceOf(bidder1.address)).to.equal(ethers.utils.parseEther("1.2"))
          expect(await erc20TestToken.balanceOf(bidder2.address)).to.equal(ethers.utils.parseEther("2"))
          expect(await erc20TestToken.balanceOf(seller1.address)).to.equal(ethers.utils.parseEther("1.3")) //+0.5 from first buyNow
          expect(await erc20TestToken.balanceOf(PokeMarketPlace.address)).to.equal(ethers.utils.parseEther("0"))
          expect(await PokeCardERC721.balanceOf(PokeMarketPlace.address)).to.equal(0)
          expect(await PokeCardERC721.balanceOf(bidder1.address)).to.equal(2)
        });
      });
    });
  });


  // it("should put NFT on sale and cancel Order", async function () {
  //     const [owner] = await ethers.getSigners();
  //     await PokeCardERC1155.mintById(owner.address, 10, 10);

  //     await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, true);
  //     const tx = await PokeMarketPlace.placeOrderForSell(10, PokeCardERC1155.address, 8, "10000000000000000000", erc20TestToken.address, 0, 0);
  //     const receipt = await tx.wait();

  //     // const txCancel = await PokeMarketPlace.cancelOrder(1);
  //     // const receiptCancel = await txCancel.wait();

  //     for (const event of receipt.events!) {
  //         console.log(`Event ${event.event} with args ${event.args}`);
  //     }
  //     // expect(await PokeMarketPlace.cancelOrder(2)).to.equal(true);
  // });

  // it("should be able to buy the NFT", async function () {
  //     const [, buyer] = await ethers.getSigners();

  //     await erc20TestToken.connect(buyer).mint("200000000000000000000")
  //     await erc20TestToken.connect(buyer).approve(PokeMarketPlace.address, "20000000000000000000");
  //     await PokeMarketPlace.connect(buyer).buyNow(1, 2, {
  //         value: ethers.utils.parseEther("0")
  //     });

  // });

  // it("Should place Offer sale order", async function () {
  //     const tokenId = 20, copies = 25;
  //     const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();
  //     await PokeCardERC1155.mintById(owner.address, tokenId, copies);

  //     await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, true);
  //     const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 9000;
  //     const minPrice = ethers.utils.parseEther("0.01");
  //     const tx = await PokeMarketPlace.placeOrderForSell(tokenId, PokeCardERC1155.address, copies, minPrice, erc20TestToken.address, endTime, 0);
  //     const receipt = await tx.wait();
  //     const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
  //     const data = receipt.logs[1].data;
  //     const topics = receipt.logs[1].topics;
  //     const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
  //     expect(event.seller).to.equal(owner.address);
  //     for (const event of receipt.events!) {
  //         console.log(`Event ${event.event} with args ${event.args}`);
  //     }

  //     orderId = event.orderId;

  // });

  // it("Place Bid to offer", async function () {
  //     const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();

  //     await erc20TestToken.connect(bidder1).mint("200000000000000000000")
  //     await erc20TestToken.connect(bidder1).approve(PokeMarketPlace.address, "20000000000000000000");

  //     await erc20TestToken.connect(bidder2).mint("200000000000000000000")
  //     await erc20TestToken.connect(bidder2).approve(PokeMarketPlace.address, "20000000000000000000");

  //     await PokeMarketPlace.connect(bidder1).placeOfferForOrder(orderId, 5, ethers.utils.parseEther("0.5"), {
  //         value: ethers.utils.parseEther("0")
  //     });

  //     const info = await PokeMarketPlace.order(orderId);
  //     const bids = await PokeMarketPlace.bids(orderId, 0);


  //     console.log("------------");

  //     const balanceBefore = await erc20TestToken.balanceOf(owner.address);
  //     console.log(balanceBefore.toString());
  //     await PokeMarketPlace.acceptBid(orderId, 0);

  //     const balanceAfter = await erc20TestToken.balanceOf(owner.address);
  //     console.log(balanceAfter.toString());
  //     console.log("------------");

  // });

  // it("place order and cancel", async function () {
  //     const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();
  //     const balanceBefore = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
  //     console.log(balanceBefore.toString());
  //     await PokeMarketPlace.connect(bidder2).placeOfferForOrder(orderId, 1, ethers.utils.parseEther("0.6"), {
  //         value: ethers.utils.parseEther("0")
  //     });
  //     const balanceAfter = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
  //     console.log(balanceAfter.toString());
  //     await PokeMarketPlace.connect(bidder2).withdrawRejectBid(orderId, 1, false);
  //     const balanceAfterWithdraw = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
  //     console.log(balanceAfterWithdraw.toString());
  // })

  // it("Should place Offer sale order native currency", async function () {
  //     const tokenId = 20, copies = 5;
  //     const [owner, buyer] = await ethers.getSigners();
  //     await PokeCardERC1155.mintById(owner.address, tokenId, copies);

  //     await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, true);
  //     const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 600;
  //     const tx = await PokeMarketPlace.placeOrderForSell(tokenId, PokeCardERC1155.address, copies, ethers.utils.parseEther("1.0"), NativeAddress, 0, 0);
  //     const receipt = await tx.wait();
  //     console.log("start bought 4 copy")

  //     const buyTx = await PokeMarketPlace.connect(buyer).buyNow(3, 4, {
  //         value: ethers.utils.parseEther("4.0")
  //     });
  //     const receiptBuy = await buyTx.wait();
  //     console.log("bought 4 copy")
  //     const buyOneTx = await PokeMarketPlace.connect(buyer).buyNow(3, 1, {
  //         value: ethers.utils.parseEther("1.0")
  //     });
  //     const receiptOneBuy = await buyOneTx.wait();

  // });

  // it("should place offer ,bid and buy in native", async function () {
  //     const tokenId = 21, copies = 5;
  //     const [owner, buyer, seller1, bidder1] = await ethers.getSigners();
  //     await PokeCardERC1155.mintById(seller1.address, tokenId, copies);
  //     await PokeCardERC1155.connect(seller1).setApprovalForAll(PokeMarketPlace.address, true);
  //     const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 9000;
  //     const minPrice = ethers.utils.parseEther("0.01")
  //     const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(tokenId, PokeCardERC1155.address, copies, minPrice, NativeAddress, endTime, 1);
  //     const receipt = await tx.wait();
  //     const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
  //     const data = receipt.logs[1].data;
  //     const topics = receipt.logs[1].topics;
  //     const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
  //     expect(event.seller).to.equal(seller1.address);
  //     for (const event of receipt.events!) {
  //         // console.log(`Event ${event.event} with args ${event.args}`);
  //     }

  //     const orderId = event.orderId;

  //     const bidTx = await PokeMarketPlace.connect(bidder1).placeOfferForOrder(orderId, 1, ethers.utils.parseEther("5.0"), {
  //         value: ethers.utils.parseEther("5.0")
  //     });

  //     const bidReceipt = await bidTx.wait();
  //     const interfaceBidTx = new ethers.utils.Interface(["event BidPlaced(uint256 indexed orderId, uint256 bidIndex, address bidder, uint16 copies, uint256 pricePerNft, uint256 bidTime);"]);
  //     console.log(bidReceipt.logs);
  //     const bidData = bidReceipt.logs[0].data;
  //     const bidTopics = bidReceipt.logs[0].topics;
  //     const bidEvent = interfaceBidTx.decodeEventLog("BidPlaced", bidData, bidTopics);

  //     console.log(bidEvent);



  //     // await PokeMarketPlace.connect(seller1).nativeAcceptBid(orderId, 0);

  //     // await PokeMarketPlace.connect(bidder1).nativeWithdrawBid(orderId, 0);

  //     await PokeMarketPlace.connect(seller1).withdrawRejectBid(orderId, 0, true);

  // });

  // it("withdraw TOKEN", async function () {
  //     const provider = ethers.getDefaultProvider();
  //     const [owner, buyer, seller1, bidder1] = await ethers.getSigners();
  //     const beforeBalance = await provider.getBalance(PokeMarketPlace.address);
  //     console.log("Before balance", beforeBalance.toString());
  //     await PokeMarketPlace.withdrawMoney((ethers.utils.parseEther("5")), NativeAddress);
  //     const afterBalance = await provider.getBalance(PokeMarketPlace.address);
  //     console.log("after balance", afterBalance);

  //     console.log("ERC20 ------------- ERC20");
  //     const erc20BeforeBalance = await erc20TestToken.balanceOf(PokeMarketPlace.address);
  //     console.log("Before balance", erc20BeforeBalance.toString());
  //     await PokeMarketPlace.withdrawMoney(erc20BeforeBalance, erc20TestToken.address);
  //     const erc20AfterBalance = await erc20TestToken.balanceOf(PokeMarketPlace.address);
  //     console.log("after balance", erc20AfterBalance);
  // });

});
