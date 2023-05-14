import { gql } from "@apollo/client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import BuyOrderGrid from "../components/BuyOrderGrid";

const Home = () => {
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
      orderBy: startTime
      orderDirection: desc
      where: {
        status: true
        nftContract_in: ["0x75362d43640cfe536520448ba2407ada56cd64dc"]
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
