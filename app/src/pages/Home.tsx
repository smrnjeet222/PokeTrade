import { gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import BuyOrderGrid from "../components/BuyOrderGrid";

const Home = () => {
  const {
    address,
    connector,
    isConnecting,
    isDisconnected,
    isConnected,
  } = useAccount();

  if (isConnecting)
    return (
      <div className="container text-center m-auto my-4 text-4xl">
        Connecting...
      </div>
    );
  if (isDisconnected)
    return (
      <div className="container text-center m-auto my-4 text-4xl">
        Disconnected
      </div>
    );
  return (
    <div className="container m-auto">
      <div className="flex justify-between items-center mb-12 mt-6">
        <h3 className="text-3xl font-black">Latest NFTs</h3>
      </div>
      <BuyOrderGrid gql={GET_OPEN_ORDERS} />
      <div className="m-32" />
    </div>
  );
};

export default Home;

const GET_OPEN_ORDERS = gql`
  query GetOpenOrders {
    orders(
      first: 50
      orderBy: startTime
      orderDirection: desc
      where: {
        copies_gt: 0
        nftContract_in: ["0x8f8a6e7eaf05eb72f9e8a8c351e00da5a54ce305"]
      }
    ) {
      id
      price
      seller
      saleType
      startTime
      endTime
      tokenId
      copies
      status
      paymentToken
      nftContract
      bids(orderBy: timestamp, orderDirection: desc, where: { status: 0 }) {
        bidder
        price
        status
        timestamp
        copies
        id
      }
    }
  }
`;
