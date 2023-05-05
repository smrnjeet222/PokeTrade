import { expect } from "chai";
import { ethers } from "hardhat";

const NativeAddress = "0x0000000000000000000000000000000000000000";

describe("marketPlace", function () {
    let PokeCardERC1155: any, PokeMarketPlace: any, erc20TestToken: any, clxnProxy: any, orderId: string;
    it("should deploy ERC20", async function () {
        const TestToken = await ethers.getContractFactory("TestToken");
        erc20TestToken = await TestToken.deploy("Test Token for test", "TTT", 18);
        await erc20TestToken.deployed();
    });
    it("Should deploy nft contract", async function () {
        const factory = await ethers.getContractFactory("PokeCardERC1155");
        PokeCardERC1155 = await factory.deploy();
        await PokeCardERC1155.deployed();
    });
    it("Should deploy market place contract", async function () {
        const factory = await ethers.getContractFactory("PokeMarketPlace");
        PokeMarketPlace = await factory.deploy();
        await PokeMarketPlace.deployed();

        const [owner] = await ethers.getSigners();

        const iniTx = await PokeMarketPlace.initialize(100, owner.address);
        await iniTx.wait();
        expect(await PokeMarketPlace.platformFees()).to.equal(100);

        const setPlatformFees = await PokeMarketPlace.setPlatformFees(200);

        // wait until the transaction is mined
        await setPlatformFees.wait();

        expect(await PokeMarketPlace.platformFees()).to.equal(200);
    });

    it("should mint NFTs", async function () {
        const [owner] = await ethers.getSigners();
        await PokeCardERC1155.mintById(owner.address, 5, 5);
        expect(await PokeCardERC1155.balanceOf(owner.address, 5)).to.equal(5);
        await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, 1);
        await PokeMarketPlace.addNftContractSupport(PokeCardERC1155.address);
        await PokeMarketPlace.addTokenSupport(erc20TestToken.address);
        expect(await PokeMarketPlace.nftContracts(PokeCardERC1155.address)).to.equal(true);
        expect(await PokeMarketPlace.tokensSupport(erc20TestToken.address)).to.equal(true);

    });

    it("should put NFT on sale", async function () {
        const [owner] = await ethers.getSigners();
        await PokeCardERC1155.mintById(owner.address, 6, 5);
        const tx = await PokeMarketPlace.placeOrderForSell(6, PokeCardERC1155.address, 5, ethers.utils.parseEther("1.0"), NativeAddress, 0, 0);
        const receipt = await tx.wait();
        const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
        const data = receipt.logs[1].data;
        const topics = receipt.logs[1].topics;
        const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
        expect(event.seller).to.equal(owner.address);
        for (const event of receipt.events) {
            // console.log(`Event ${event.event} with args ${event.args}`);
        }

        const OrderId = event.orderId;

        // const holdTx = await PokeMarketPlace.putOrderOnHold(OrderId);
        // await holdTx.wait();
        //
        // console.log(OrderId);

        const orderInfo = await PokeMarketPlace.order(OrderId);

        console.log(orderInfo);

        const balance = await PokeCardERC1155.balanceOf(PokeMarketPlace.address, 6);

        console.log(balance);

        await PokeMarketPlace.bulkBuy([OrderId], [5], {
            value: ethers.utils.parseEther("5.0")
        });
    });


    it("should put NFT on sale and cancel Order", async function () {
        const [owner] = await ethers.getSigners();
        await PokeCardERC1155.mintById(owner.address, 10, 10);

        await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, 1);
        const tx = await PokeMarketPlace.placeOrderForSell(10, PokeCardERC1155.address, 8, "10000000000000000000", erc20TestToken.address, 0, 0);
        const receipt = await tx.wait();

        // const txCancel = await PokeMarketPlace.cancelOrder(1);
        // const receiptCancel = await txCancel.wait();

        for (const event of receipt.events) {
            console.log(`Event ${event.event} with args ${event.args}`);
        }
        // expect(await PokeMarketPlace.cancelOrder(2)).to.equal(true);
    });
    it("should be able to buy the NFT", async function () {
        const [, buyer] = await ethers.getSigners();

        await erc20TestToken.connect(buyer).mint("200000000000000000000")
        await erc20TestToken.connect(buyer).approve(PokeMarketPlace.address, "20000000000000000000");
        await PokeMarketPlace.connect(buyer).buyNow(1, 2, {
            value: ethers.utils.parseEther("0")
        });

    });

    it("Should place Offer sale order", async function () {
        const tokenId = 20, copies = 25;
        const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();
        await PokeCardERC1155.mintById(owner.address, tokenId, copies);

        await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, 1);
        const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 9000;
        const minPrice = ethers.utils.parseEther("0.01");
        const tx = await PokeMarketPlace.placeOrderForSell(tokenId, PokeCardERC1155.address, copies, minPrice, erc20TestToken.address, endTime, 0);
        const receipt = await tx.wait();
        const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
        const data = receipt.logs[1].data;
        const topics = receipt.logs[1].topics;
        const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
        expect(event.seller).to.equal(owner.address);
        for (const event of receipt.events) {
            // console.log(`Event ${event.event} with args ${event.args}`);
        }

        orderId = event.orderId;

    });

    it("Place Bid to offer", async function () {
        const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();

        await erc20TestToken.connect(bidder1).mint("200000000000000000000")
        await erc20TestToken.connect(bidder1).approve(PokeMarketPlace.address, "20000000000000000000");

        await erc20TestToken.connect(bidder2).mint("200000000000000000000")
        await erc20TestToken.connect(bidder2).approve(PokeMarketPlace.address, "20000000000000000000");

        await PokeMarketPlace.connect(bidder1).placeOfferForOrder(orderId, 5, ethers.utils.parseEther("0.5"), {
            value: ethers.utils.parseEther("0")
        });

        const info = await PokeMarketPlace.order(orderId);
        const bids = await PokeMarketPlace.bids(orderId, 0);


        console.log("------------");

        const balanceBefore = await erc20TestToken.balanceOf(owner.address);
        console.log(balanceBefore.toString());
        await PokeMarketPlace.acceptBid(orderId, 0);

        const balanceAfter = await erc20TestToken.balanceOf(owner.address);
        console.log(balanceAfter.toString());
        console.log("------------");

    });

    it("place order and cancel", async function () {
        const [owner, buyer, bidder1, bidder2] = await ethers.getSigners();
        const balanceBefore = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
        console.log(balanceBefore.toString());
        await PokeMarketPlace.connect(bidder2).placeOfferForOrder(orderId, 1, ethers.utils.parseEther("0.6"), {
            value: ethers.utils.parseEther("0")
        });
        const balanceAfter = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
        console.log(balanceAfter.toString());
        await PokeMarketPlace.connect(bidder2).withdrawRejectBid(orderId, 1, 0);
        const balanceAfterWithdraw = await erc20TestToken.connect(bidder2).balanceOf(bidder2.address);
        console.log(balanceAfterWithdraw.toString());
    })

    it("Should place Offer sale order native currency", async function () {
        const tokenId = 20, copies = 5;
        const [owner, buyer] = await ethers.getSigners();
        await PokeCardERC1155.mintById(owner.address, tokenId, copies);

        await PokeCardERC1155.setApprovalForAll(PokeMarketPlace.address, 1);
        const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 600;
        const tx = await PokeMarketPlace.placeOrderForSell(tokenId, PokeCardERC1155.address, copies, ethers.utils.parseEther("1.0"), NativeAddress, 0, 0);
        const receipt = await tx.wait();
        console.log("start bought 4 copy")

        const buyTx = await PokeMarketPlace.connect(buyer).buyNow(3, 4, {
            value: ethers.utils.parseEther("4.0")
        });
        const receiptBuy = await buyTx.wait();
        console.log("bought 4 copy")
        const buyOneTx = await PokeMarketPlace.connect(buyer).buyNow(3, 1, {
            value: ethers.utils.parseEther("1.0")
        });
        const receiptOneBuy = await buyOneTx.wait();

    });

    it("should place offer ,bid and buy in native", async function () {
        const tokenId = 21, copies = 5;
        const [owner, buyer, seller1, bidder1] = await ethers.getSigners();
        await PokeCardERC1155.mintById(seller1.address, tokenId, copies);
        await PokeCardERC1155.connect(seller1).setApprovalForAll(PokeMarketPlace.address, 1);
        const endTime = parseInt((Date.now() / 1000).toFixed(2)) + 9000;
        const minPrice = ethers.utils.parseEther("0.01")
        const tx = await PokeMarketPlace.connect(seller1).placeOrderForSell(tokenId, PokeCardERC1155.address, copies, minPrice, NativeAddress, endTime, 1);
        const receipt = await tx.wait();
        const interfaceTx = new ethers.utils.Interface(["event OrderCreated(uint256 indexed orderId, uint256 indexed tokenId, uint256 price, address seller, uint16 copies, uint8 salesType, uint256 startTime, uint256 endTime, address paymentToken, address nftContract);"]);
        const data = receipt.logs[1].data;
        const topics = receipt.logs[1].topics;
        const event = interfaceTx.decodeEventLog("OrderCreated", data, topics);
        expect(event.seller).to.equal(seller1.address);
        for (const event of receipt.events) {
            // console.log(`Event ${event.event} with args ${event.args}`);
        }

        const orderId = event.orderId;

        const bidTx = await PokeMarketPlace.connect(bidder1).placeOfferForOrder(orderId, 1, ethers.utils.parseEther("5.0"), {
            value: ethers.utils.parseEther("5.0")
        });

        const bidReceipt = await bidTx.wait();
        const interfaceBidTx = new ethers.utils.Interface(["event BidPlaced(uint256 indexed orderId, uint256 bidIndex, address bidder, uint16 copies, uint256 pricePerNft, uint256 bidTime);"]);
        console.log(bidReceipt.logs);
        const bidData = bidReceipt.logs[0].data;
        const bidTopics = bidReceipt.logs[0].topics;
        const bidEvent = interfaceBidTx.decodeEventLog("BidPlaced", bidData, bidTopics);

        console.log(bidEvent);



        // await PokeMarketPlace.connect(seller1).nativeAcceptBid(orderId, 0);

        // await PokeMarketPlace.connect(bidder1).nativeWithdrawBid(orderId, 0);

        await PokeMarketPlace.connect(seller1).withdrawRejectBid(orderId, 0, 1);

    });

    it("withdraw TOKEN", async function () {
        const provider = ethers.getDefaultProvider();
        const [owner, buyer, seller1, bidder1] = await ethers.getSigners();
        const beforeBalance = await provider.getBalance(PokeMarketPlace.address);
        console.log("Before balance", beforeBalance.toString());
        await PokeMarketPlace.withdrawMoney((ethers.utils.parseEther("5")), NativeAddress);
        const afterBalance = await provider.getBalance(PokeMarketPlace.address);
        console.log("after balance", afterBalance);

        console.log("ERC20 ------------- ERC20");
        const erc20BeforeBalance = await erc20TestToken.balanceOf(PokeMarketPlace.address);
        console.log("Before balance", erc20BeforeBalance.toString());
        await PokeMarketPlace.withdrawMoney(erc20BeforeBalance, erc20TestToken.address);
        const erc20AfterBalance = await erc20TestToken.balanceOf(PokeMarketPlace.address);
        console.log("after balance", erc20AfterBalance);
    });

});
