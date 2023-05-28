import {
  OrderCreated as OrderCreatedEvent,
  OrderCancelled as OrderCancelledEvent,
  OrderPurchased as OrderPurchasedEvent,
  BidPlaced as BidPlacedEvent,
  BidWithdraw as BidWithdrawEvent,
  BidRejected as BidRejectedEvent,
  BidAccepted as BidAcceptedEvent,
} from "../generated/PokeMarketPlace/PokeMarketPlace"
import { ipfs, json, log } from "@graphprotocol/graph-ts";
import {
  NFT as NFTContract
} from "../generated/PokeMarketPlace/NFT";

import { Order, Bid, Purchase, NftMeta } from "../generated/schema"

export function handleOrderCreate(event: OrderCreatedEvent): void {
  const orderId = event.params.orderId.toString();

  const nftAddress = event.params.nftContract.toHex();

  let OrderInfo = Order.load(orderId);
  let NftMetaInfo = NftMeta.load(`${nftAddress}-${event.params.tokenId}`);
  if (!NftMetaInfo) {
    const nftContract = NFTContract.bind(event.params.nftContract);

    const tokenUri = nftContract.tokenURI(event.params.tokenId);
    const tokenUriTry = nftContract.try_tokenURI(event.params.tokenId);
    log.debug('Message to be displayed: {}, {}, {}',
      [nftAddress.toString(), tokenUri.toString(), tokenUriTry.value]
    );
    if (tokenUri) {
      NftMetaInfo = new NftMeta(`${nftAddress}-${event.params.tokenId}`);

      NftMetaInfo.tokenId = event.params.tokenId;
      NftMetaInfo.nftContract = nftAddress;
      NftMetaInfo.tokenUri = tokenUri;

      let data = ipfs.cat(tokenUri)
      if (data) {
        let value = json.fromBytes(data).toObject()
        if (value) {
          const name = value.get("name")
          if (name) {
            NftMetaInfo.name = name.toString();
          }
          const image = value.get("image")
          if (image) {
            NftMetaInfo.image = image.toString();
          }
        }
      }
      NftMetaInfo.save()
    }
  }

  if (!OrderInfo) {
    OrderInfo = new Order(orderId);
    OrderInfo.price = event.params.price;
    OrderInfo.seller = event.params.seller.toHex();
    OrderInfo.saleType = event.params.saleType;
    OrderInfo.startTime = event.params.startTime;
    OrderInfo.endTime = event.params.endTime;
    OrderInfo.tokenId = event.params.tokenId;
    OrderInfo.copies = event.params.copies;
    OrderInfo.paymentToken = event.params.paymentToken.toHex();
    OrderInfo.nftContract = event.params.nftContract.toHex();
    OrderInfo.status = true;
    OrderInfo.nftType = event.params.copies === 0 ? "ERC721" : "ERC1155"
    if (NftMetaInfo) {
      OrderInfo.nftMetadata = NftMetaInfo.id
    }
  }
  OrderInfo.save();
}

export function handleOrderCancel(event: OrderCancelledEvent): void {
  const orderId = event.params.orderId.toString();

  const order = Order.load(orderId);

  if (order) {
    order.status = false;
    order.save();
  }
}

export function handleOrderPurchase(event: OrderPurchasedEvent): void {
  const orderId = event.params.orderId.toString();

  const order = Order.load(orderId);

  if (order) {
    const purchase = new Purchase(orderId + "-" + order.copies.toString() + "-" + event.params.copies.toString());
    order.status = !!(order.copies - event.params.copies);
    order.copies -= event.params.copies;
    order.buyer = event.params.buyer.toHex();
    order.save();
    purchase.copies = event.params.copies;
    purchase.buyer = event.params.buyer.toHex();
    purchase.order = orderId
    purchase.save();
  }
}

export function handleBidPlace(event: BidPlacedEvent): void {
  const orderId = event.params.orderId.toString();
  const bidId = event.params.bidIndex.toString();

  const bid = Bid.load(orderId + "-" + bidId);
  if (!bid) {
    let newBid = new Bid(orderId + "-" + bidId);
    newBid.bidder = event.params.bidder.toHex();
    newBid.copies = event.params.copies;
    newBid.price = event.params.pricePerNft;
    newBid.timestamp = event.params.bidTime;
    newBid.status = 0;
    newBid.order = orderId;
    newBid.save();
  }
}

export function handleBidAccepted(event: BidAcceptedEvent): void {
  const orderId = event.params.orderId.toString();
  const order = Order.load(orderId);

  const bidId = event.params.bidId.toString();
  const bid = Bid.load(orderId + "-" + bidId);

  if (order && bid) {
    const purchase = new Purchase(orderId + "-" + order.copies.toString() + "-" + event.params.copies.toString());
    order.status = !!(order.copies - event.params.copies);
    order.copies -= event.params.copies;
    order.buyer = bid.bidder;
    order.save();
    purchase.copies = event.params.copies;
    purchase.buyer = bid.bidder;
    purchase.order = orderId;
    purchase.save();

    bid.status = 1;
    bid.save();
  }
}
export function handleBidReject(event: BidRejectedEvent): void {
  const orderId = event.params.orderId.toString();
  const bidId = event.params.bidId.toString();
  const bid = Bid.load(orderId + "-" + bidId);

  if (bid) {
    bid.status = 2;
    bid.save();
  }
}

export function handleBidWithdraw(event: BidWithdrawEvent): void {
  const orderId = event.params.orderId.toString();
  const bidId = event.params.bidId.toString();
  const bid = Bid.load(orderId + "-" + bidId);

  if (bid) {
    bid.status = 3;
    bid.save();
  }
}