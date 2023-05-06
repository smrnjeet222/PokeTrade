// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155ReceiverUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract PokeMarketPlace is
    ReentrancyGuardUpgradeable,
    IERC1155ReceiverUpgradeable,
    OwnableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    address payable public adminOwner;
    bool isPaused = false;

    struct Order {
        uint256 tokenId;
        uint256 price;
        address seller;
        uint16 copies;
        SaleType saleType;
        uint256 startTime;
        uint256 endTime;
        address paymentToken;
        address nftContract;
    }

    struct Bid {
        address bidder;
        uint16 copies;
        uint256 price;
        uint256 timestamp;
        BidStatus status;
    }

    mapping(uint256 => Order) public order;
    mapping(uint256 => Bid[]) public bids;
    mapping(address => bool) public nftContracts;
    mapping(address => bool) public tokensSupport;

    uint256 public orderNonce;
    uint256 public platformFees;

    enum SaleType {
        BuyNow,
        OpenForOffers
    }

    enum BidStatus {
        Placed,
        Accepted,
        Rejected,
        Withdraw
    }

    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed tokenId,
        uint256 price,
        address seller,
        uint16 copies,
        SaleType saleType,
        uint256 startTime,
        uint256 endTime,
        address paymentToken,
        address nftContract
    );
    event OrderCancelled(uint256 indexed orderId);
    event OrderPurchased(uint256 indexed orderId, address buyer, uint16 copies);
    event BidPlaced(
        uint256 indexed orderId,
        uint256 bidIndex,
        address bidder,
        uint16 copies,
        uint256 pricePerNft,
        uint256 bidTime
    );
    event BidWithdraw(uint256 indexed orderId, uint256 bidId);
    event BidRejected(uint256 indexed orderId, uint256 bidId);
    event BidAccepted(uint256 indexed orderId, uint256 bidId, uint16 copies);
    event NFTBulkBuy(uint256[] orderIds, uint256[] copies);

    function initialize(
        uint256 _platformFees,
        address _admin
    ) external initializer {
        adminOwner = payable(_admin);
        platformFees = _platformFees;
        __Ownable_init();
    }

    function addNftContractSupport(address contractAddress) public onlyOwner {
        nftContracts[contractAddress] = true;
    }

    function addTokenSupport(address tokenAddress) public onlyOwner {
        tokensSupport[tokenAddress] = true;
    }

    function setPlatformFees(uint256 fee) external onlyOwner {
        require(fee <= 5000, "High fee");
        platformFees = fee;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC1155ReceiverUpgradeable).interfaceId;
    }

    function placeOrderForSell(
        uint256 tokenId,
        address nftContract,
        uint16 copies,
        uint256 pricePerNFT,
        address paymentToken,
        uint256 endTime,
        SaleType saleType
    ) external {
        require(pricePerNFT > 0, "Invalid price");
        require(
            nftContract != address(0) && nftContracts[nftContract],
            "Invalid NFT Contract"
        );
        require(
            saleType == SaleType.BuyNow || saleType == SaleType.OpenForOffers,
            "Invalid sale"
        );
        require(
            (paymentToken == address(0) || tokensSupport[paymentToken]),
            "Invalid token Contract"
        );
        order[orderNonce] = Order(
            tokenId,
            pricePerNFT,
            msg.sender,
            copies,
            saleType,
            block.timestamp,
            endTime,
            paymentToken,
            nftContract
        );
        orderNonce++;
        IERC1155Upgradeable(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            copies,
            ""
        );
        emit OrderCreated(
            orderNonce - 1,
            tokenId,
            pricePerNFT,
            msg.sender,
            copies,
            saleType,
            block.timestamp,
            endTime,
            paymentToken,
            nftContract
        );
    }

    function cancelOrder(uint256 orderId) external {
        Order storage _order = order[orderId];
        require(_order.seller == msg.sender, "Invalid request");

        IERC1155Upgradeable(_order.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            _order.tokenId,
            _order.copies,
            ""
        );

        if (_order.saleType == SaleType.OpenForOffers) {
            returnAmountToRemainingBidder(
                orderId,
                _order.paymentToken == address(0)
            );
        }

        delete order[orderId];
        emit OrderCancelled(orderId);
    }

    function buyNow(
        uint256 orderId,
        uint16 copies
    ) external payable nonReentrant {
        Order storage _order = order[orderId];
        require(_order.saleType == SaleType.BuyNow, "Invalid Sales type");
        bool isNative = _order.paymentToken == address(0);

        uint256 totalAmount = _order.price * copies;
        if (isNative) {
            require(msg.value >= totalAmount, "Not sufficient funds");
        }
        uint256 feeValue = (platformFees * totalAmount) / 10000;

        if (!isNative) {
            IERC20Upgradeable ERC20Interface = IERC20Upgradeable(
                _order.paymentToken
            );
            ERC20Interface.safeTransferFrom(
                msg.sender,
                address(this),
                totalAmount
            );

            ERC20Interface.safeTransfer(
                (_order.seller),
                totalAmount - feeValue
            );
        }
        IERC1155Upgradeable(_order.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            _order.tokenId,
            copies,
            ""
        );
        address sellerAddress = _order.seller;
        if (_order.copies == copies) {
            delete (order[orderId]);
        } else {
            order[orderId].copies -= copies;
        }
        if (isNative) {
            (bool success, ) = payable(sellerAddress).call{
                value: totalAmount - feeValue
            }("");
            require(success, "Transfer Failed");
        }
        emit OrderPurchased(orderId, msg.sender, copies);
    }

    function placeOfferForOrder(
        uint256 orderId,
        uint16 copies,
        uint256 pricePerNFT
    ) external payable {
        Order storage _order = order[orderId];
        require(_order.seller != address(0), "Invalid order request");
        bool isNative = _order.paymentToken == address(0);

        require(_order.seller != msg.sender, "Invalid request");

        require(_order.endTime > block.timestamp, "Order expired ");
        require(_order.price <= pricePerNFT, "Invalid Price");
        require(copies <= _order.copies && copies > 0, "not enough quantity");

        uint256 totalBids = bids[orderId].length;

        uint256 totalAmount = pricePerNFT * copies;
        if (isNative) {
            require(msg.value >= totalAmount, "not enough balance");
        } else {
            IERC20Upgradeable ERC20Interface = IERC20Upgradeable(
                _order.paymentToken
            );
            uint256 approvedAmount = ERC20Interface.allowance(
                msg.sender,
                address(this)
            );
            uint256 balance = ERC20Interface.balanceOf(msg.sender);
            require(approvedAmount >= totalAmount, "allowance issue");
            require(balance >= totalAmount, "not enough balance");
            ERC20Interface.safeTransferFrom(
                msg.sender,
                address(this),
                totalAmount
            );
        }
        bids[orderId].push(
            Bid(
                msg.sender,
                copies,
                pricePerNFT,
                block.timestamp,
                BidStatus.Placed
            )
        );

        emit BidPlaced(
            orderId,
            totalBids,
            msg.sender,
            copies,
            pricePerNFT,
            block.timestamp
        );
    }

    function acceptBid(uint256 orderId, uint256 bidId) external {
        Order storage _order = order[orderId];
        Bid storage _bid = bids[orderId][bidId];
        require(_order.copies >= _bid.copies, "Nft not available");
        require(_order.seller == msg.sender, "not invlid request");
        require(_bid.status == BidStatus.Placed, "Bid not valid anymore");

        bool isNative = _order.paymentToken == address(0);

        uint256 totalAmount = _bid.price * _bid.copies;
        uint256 feeValue = (platformFees * totalAmount) / 10000;

        IERC1155Upgradeable(_order.nftContract).setApprovalForAll(
            _bid.bidder,
            true
        );

        IERC1155Upgradeable(_order.nftContract).safeTransferFrom(
            address(this),
            _bid.bidder,
            _order.tokenId,
            _bid.copies,
            ""
        );
        if (!isNative) {
            safeTransferAmount(
                _order.paymentToken,
                msg.sender,
                (totalAmount - feeValue)
            );
        }
        bids[orderId][bidId].status = BidStatus.Accepted;
        _order.copies = _order.copies - _bid.copies;
        if (_order.copies == 0) {
            returnAmountToRemainingBidder(orderId, isNative);
        }
        if (isNative) {
            (bool success, ) = payable(_order.seller).call{
                value: totalAmount - feeValue
            }("");
            require(success, "Transfer Failed");
        }
        emit BidAccepted(orderId, bidId, _bid.copies);
    }

    function withdrawRejectBid(
        uint256 orderId,
        uint256 bidId,
        bool isReject
    ) external {
        Order storage _order = order[orderId];
        Bid storage _bid = bids[orderId][bidId];

        if (isReject) {
            require(_order.seller == msg.sender, "cant process");
        } else {
            require(_bid.bidder == msg.sender, "cant process");
        }

        require(_bid.status == BidStatus.Placed, "cant process");

        bool isNative = _order.paymentToken == address(0);

        uint256 totalAmount = _bid.price * _bid.copies;
        if (!isNative) {
            safeTransferAmount(_order.paymentToken, msg.sender, totalAmount);
        }
        if (isReject) {
            bids[orderId][bidId].status = BidStatus.Rejected;
            emit BidRejected(orderId, bidId);
        } else {
            bids[orderId][bidId].status = BidStatus.Withdraw;
            emit BidWithdraw(orderId, bidId);
        }
        if (isNative) {
            (bool success, ) = payable(_bid.bidder).call{value: totalAmount}(
                ""
            );
            require(success, "Transfer Failed");
        }
    }

    function bulkBuy(
        uint256[] calldata orderIds,
        uint256[] calldata amounts
    ) external payable OnlyAdminOwner {
        uint256 payAmount = 0;
        uint256[] memory tokenIds = new uint256[](orderIds.length);
        address[] memory tokenContract = new address[](orderIds.length);
        bool amountSupplyIssue;
        for (uint8 i = 0; i < orderIds.length; i++) {
            uint256 id = orderIds[i];
            Order storage _order = order[orderIds[i]];
            tokenIds[i] = order[id].tokenId;
            payAmount += (order[id].price * amounts[i]);
            if (amounts[i] > order[id].copies) {
                amountSupplyIssue = true;
            }
            tokenContract[i] = _order.nftContract;
            _order.copies -= uint16(amounts[i]);
        }
        require(
            amountSupplyIssue == false && payAmount <= msg.value,
            "Iv Amount"
        );

        for (uint8 i = 0; i < tokenContract.length; i++) {
            IERC1155Upgradeable(tokenContract[i]).safeTransferFrom(
                address(this),
                msg.sender,
                tokenIds[i],
                amounts[i],
                ""
            );
        }

        emit NFTBulkBuy(orderIds, amounts);
    }

    modifier OnlyAdminOwner() {
        require(msg.sender == adminOwner, "Not Admin");
        _;
    }

    function withdrawMoney(
        uint256 amount,
        address tokenAddress
    ) external onlyOwner {
        if (tokenAddress == address(0)) {
            payable(adminOwner).transfer(amount);
        } else {
            require(tokensSupport[tokenAddress], "unsupported token address");
            IERC20Upgradeable ERC20Interface = IERC20Upgradeable(tokenAddress);
            uint256 balance = ERC20Interface.balanceOf(msg.sender);
            require(balance >= amount, "balance Insufficient");
            ERC20Interface.safeTransfer(adminOwner, amount);
        }
    }

    function safeTransferAmount(
        address token,
        address to,
        uint256 amount
    ) private {
        IERC20Upgradeable ERC20Interface = IERC20Upgradeable(token);
        ERC20Interface.safeTransfer(to, amount);
    }

    function returnAmountToRemainingBidder(
        uint256 orderId,
        bool isNative
    ) private {
        Order storage _order = order[orderId];
        for (uint8 i = 0; i < bids[orderId].length; i++) {
            if (bids[orderId][i].status == BidStatus.Placed) {
                uint256 amount = bids[orderId][i].copies *
                    bids[orderId][i].price;
                bids[orderId][i].status = BidStatus.Rejected;
                if (isNative) {
                    (bool success, ) = payable(bids[orderId][i].bidder).call{
                        value: amount
                    }("");
                    require(success, "Transfer Failed");
                } else {
                    safeTransferAmount(
                        _order.paymentToken,
                        bids[orderId][i].bidder,
                        amount
                    );
                }
            }
        }
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return (
            bytes4(
                keccak256(
                    "onERC1155Received(address,address,uint256,uint256,bytes)"
                )
            )
        );
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external pure override returns (bytes4) {
        return (
            bytes4(
                keccak256(
                    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"
                )
            )
        );
    }
}
