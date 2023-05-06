import { Dialog, Tab, Transition } from "@headlessui/react";
import axios from "axios";
import Decimal from "decimal.js";
import { Contract, ContractInterface, ethers } from "ethers";
import { Fragment, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { getCustomIpfsUrl } from "../utils/ipfs";
import NFT_ABI from "../contracts/PokeCardERC1155.json";
import { useAccount } from "wagmi";
import { MARKETPLACE } from "../contracts";

export type NftData = {
  name: string;
  image: string;
  description: string;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function BuyNowTab({ nft, nftName }: any) {
  const { address, connector } = useAccount();

  const [buyingQuantity, setBuyingQuantity] = useState(1);

  const [buyingState, setBuyingState] = useState<any>({
    loading: false,
    error: null,
    hash: null,
  });

  const handleBuyNow = async () => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      const buyTx = await marketPlaceContract.buyNow(
        nft.id,
        buyingQuantity,
        {
          value: new Decimal(nft.price).mul(buyingQuantity).toString(),
        }
      );
      await buyTx.wait();
      setBuyingState({ loading: false, error: null, hash: buyTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-2">
        <span className="text-sm font-normal">#{nft.tokenId}&nbsp;</span>
        {nftName}
      </h2>
      <div className="form-control gap-3">
        <label className="flex items-baseline gap-2 font-medium">
          Quantity <span className="text-xs">(max : {nft.copies})</span>
        </label>
        <input
          type="number"
          disabled={!address}
          min={1}
          step={1}
          max={nft.copies}
          value={buyingQuantity}
          onChange={(event) =>
            setBuyingQuantity(
              Math.floor(
                Math.min(Number(event.target.value), Number(nft.copies))
              ) || 0
            )
          }
          placeholder="Total Quantity"
          className="input input-bordered w-full"
        />
        <label className="flex items-center gap-2 font-medium">
          <span className="text-sm font-normal">
            Total amount to pay:&nbsp;&nbsp;
          </span>
          <span className="">
            <svg viewBox="0 0 38.4 33.5" className="w-4 h-4">
              <path
                fill="#8247E5"
                d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3 c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
              />
            </svg>
          </span>
          <span>
            {new Decimal(nft.price)
              .div(new Decimal(10).pow(18))
              .mul(buyingQuantity)
              .toString()}
          </span>
        </label>
      </div>
      <br />
      <button
        disabled={buyingState.loading}
        className="retro-btn bg-white w-full disabled:loading"
        onClick={handleBuyNow}
      >
        Buy Nft
      </button>
    </>
  );
}

function OpenForOffersTab({ nft, nftName, onlyBids }: any) {
  const { address, connector } = useAccount();

  const [buyBid, setBidPrice] = useState(
    new Decimal(nft.price).div(new Decimal(10).pow(18)).toNumber()
  );
  const [buyingQuantity, setBuyingQuantity] = useState(1);

  const [buyingState, setBuyingState] = useState<any>({
    loading: false,
    error: null,
    hash: null,
  });

  const handlePlaceOffer = async () => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      console.log(nft);
      let price = new Decimal(buyBid);
      price = price.mul(new Decimal(10).pow(18));

      const buyTx = await marketPlaceContract.nativePlaceOfferForOrder(
        nft.id,
        buyingQuantity,
        price.toString(),
        {
          value: price.mul(new Decimal(buyingQuantity)).toString(),
        }
      );
      await buyTx.wait();
      setBuyingState({ loading: false, error: null, hash: buyTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  const handleOrderCancel = async (id: string) => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      const cancelTx = await marketPlaceContract.cancelOrder(id);

      await cancelTx.wait();
      setBuyingState({ loading: false, error: null, hash: cancelTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  const handleWithdrawBid = async (id: string) => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      const withdrawBidTx = await marketPlaceContract.withdrawRejectBid(
        nft.id,
        id,
        false
      );

      await withdrawBidTx.wait();
      setBuyingState({ loading: false, error: null, hash: withdrawBidTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  const handleAcceptBid = async (id: string) => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      const acceptBidTx = await marketPlaceContract.acceptBid(nft.id, id);

      await acceptBidTx.wait();
      setBuyingState({ loading: false, error: null, hash: acceptBidTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  const handleRejectBid = async (id: string) => {
    setBuyingState({
      loading: true,
      error: null,
      hash: null,
    });
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );
      console.log(nft.id, id);

      const rejectBidTx = await marketPlaceContract.withdrawRejectBid(
        nft.id,
        id,
        true
      );

      await rejectBidTx.wait();
      setBuyingState({ loading: false, error: null, hash: rejectBidTx.hash });
    } catch (err) {
      console.error(err);
      setBuyingState({ loading: false, error: err, hash: null });
    }
  };

  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-base-200/50 p-1">
        <Tab
          className={({ selected }) =>
            classNames(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-secondary",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
              selected
                ? "bg-white shadow"
                : "text-base-300 hover:bg-white/[0.12] !disabled:hover:text-secondary"
            )
          }
          disabled={onlyBids}
        >
          Place Offer
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-secondary",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
              selected
                ? "bg-white shadow"
                : "text-base-300 hover:bg-white/[0.12] hover:text-secondary"
            )
          }
        >
          Open Bids
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <h2 className="text-xl font-bold my-4">
          <span className="text-sm font-normal">#{nft.tokenId}&nbsp;</span>
          {nftName}
        </h2>
        <div className="flex m-2 justify-between items-baseline">
          <span className="text-xs">Bid End Time</span>
          <span className="text-lg font-medium">
            {new Date(Number(nft.endTime)).toLocaleString()}
          </span>
        </div>
        <Tab.Panel className="mt-4">
          <>
            <div className="form-control gap-1">
              <label className="flex items-baseline gap-2 font-medium">
                Place Offer Price <span className="text-xs">(per NFT)</span>
              </label>
              <label className="input-group">
                <span className="">
                  <svg viewBox="0 0 38.4 33.5" className="w-4 h-4">
                    <path
                      fill="#8247E5"
                      d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3 c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                    />
                  </svg>
                </span>
                <input
                  type="number"
                  min={new Decimal(nft.price)
                    .div(new Decimal(10).pow(18))
                    .toString()}
                  step={0.1}
                  value={buyBid}
                  onChange={(event) =>
                    setBidPrice(
                      Math.max(
                        Number(event.target.value),
                        Number(
                          new Decimal(nft.price)
                            .div(new Decimal(10).pow(18))
                            .toNumber()
                        )
                      )
                    )
                  }
                  placeholder="Enter Price for one item"
                  className="input input-bordered w-full"
                />
              </label>
            </div>
            <br />
            <div className="form-control gap-3">
              <label className="flex items-baseline gap-2 font-medium">
                Quantity <span className="text-xs">(max : {nft.copies})</span>
              </label>
              <input
                type="number"
                disabled={!address}
                min={1}
                step={1}
                max={nft.copies}
                value={buyingQuantity}
                onChange={(event) =>
                  setBuyingQuantity(
                    Math.floor(
                      Math.min(Number(event.target.value), nft.copies)
                    ) || 0
                  )
                }
                placeholder="Total Quantity"
                className="input input-bordered w-full"
              />
              <label className="flex items-center gap-2 font-medium">
                <span className="text-sm font-normal">
                  Total amount to pay:&nbsp;&nbsp;
                </span>
                <span className="">
                  <svg viewBox="0 0 38.4 33.5" className="w-4 h-4">
                    <path
                      fill="#8247E5"
                      d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3 c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                    />
                  </svg>
                </span>
                <span>
                  {new Decimal(buyBid)
                    .mul(new Decimal(buyingQuantity))
                    .toString()}
                </span>
              </label>
            </div>
            <br />
            <button
              disabled={buyingState.loading}
              className="btn btn-secondary w-full disabled:loading"
              onClick={handlePlaceOffer}
            >
              Place Offer
            </button>
          </>
        </Tab.Panel>
        <Tab.Panel className="flex flex-col mt-4 text-center gap-2 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="normal-case">Bidder</th>
                <th className="flex gap-2 items-center normal-case">
                  Price
                  <svg viewBox="0 0 38.4 33.5" className="w-3 h-3">
                    <path
                      fill="#8247E5"
                      d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                    />
                  </svg>
                </th>
                <th className="normal-case">Copies</th>
                <th className="normal-case text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!nft.bids.length ? (
                <tr className="border text-error">
                  <td> No Open Bids </td>
                </tr>
              ) : (
                nft.bids.map((bid: any) => (
                  <tr key={bid.id} className="border">
                    <td>
                      {bid.bidder.substring(0, 4)}...
                      {bid.bidder.substring(bid.bidder.length - 6)}
                    </td>
                    <td>
                      {new Decimal(bid.price ?? 0)
                        .div(new Decimal(10).pow(18))
                        .toString()}
                    </td>
                    <td>{bid.copies}</td>
                    <td>
                      <div className="flex gap-2 justify-center">
                        {ethers.utils.getAddress(bid.bidder) ===
                          ethers.utils.getAddress(address!) && (
                          <button
                            className="btn btn-xs btn-secondary btn-outline normal-case disabled:loading"
                            disabled={buyingState.loading}
                            onClick={() =>
                              handleWithdrawBid(bid.id.split("-")[1])
                            }
                          >
                            Withdraw
                          </button>
                        )}
                        {ethers.utils.getAddress(nft.seller) ===
                          ethers.utils.getAddress(address!) && (
                          <>
                            <button
                              className="btn btn-xs btn-secondary btn-outline normal-case disabled:loading"
                              disabled={buyingState.loading}
                              onClick={() =>
                                handleAcceptBid(bid.id.split("-")[1])
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-xs btn-accent btn-outline normal-case disabled:loading"
                              disabled={buyingState.loading}
                              onClick={() =>
                                handleRejectBid(bid.id.split("-")[1])
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {ethers.utils.getAddress(nft.seller) ===
            ethers.utils.getAddress(address!) && (
            <button
              disabled={buyingState.loading}
              className="btn btn-accent w-full disabled:loading"
              onClick={() => handleOrderCancel(nft.id)}
            >
              Cancel Order
            </button>
          )}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}

function BuyModal({ isOpen, closeModal, nft, nftName, onlyBids = false }: any) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          console.log("Closed");
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-max min-w-[40vw] transform rounded-2xl 
                bg-base-100 p-6 text-left align-middle shadow-xl transition-all
              "
              >
                <button
                  className="btn btn-circle btn-xs btn-error absolute top-1 right-1"
                  onClick={closeModal}
                >
                  <svg width={8} height={8} fill="none">
                    <path
                      fill="#fff"
                      d="M7.754 7.754a.838.838 0 0 1-1.185 0L4 5.186 1.431 7.754A.838.838 0 0 1 .246 6.57L2.814 4 .246 1.431A.838.838 0 1 1 1.43.246L4 2.814 6.569.246A.838.838 0 0 1 7.754 1.43L5.186 4l2.568 2.569a.838.838 0 0 1 0 1.185Z"
                    />
                  </svg>
                </button>
                {nft.saleType === 0 ? (
                  <BuyNowTab nft={nft} nftName={nftName} />
                ) : nft.saleType === 1 ? (
                  <OpenForOffersTab
                    nft={nft}
                    nftName={nftName}
                    onlyBids={onlyBids}
                  />
                ) : (
                  <div>This Sale Type is Not Valid {nft.saleType}</div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function BuyCard({ nft }: any) {
  const { address, connector } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [onlyBids, setOnlyBids] = useState(false);
  const [nftData, setNftData] = useState<NftData>({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    (async () => {
      if (!connector) return;
      const signer = await connector.getSigner();
      const nftContract = new Contract(
        nft.nftContract,
        NFT_ABI.abi as ContractInterface,
        signer
      );
      const tokenId = nft.tokenId;
      const nftUrl: string = await nftContract.tokenURI(tokenId as string);
      if (!tokenId || !nftUrl) {
        console.error("tokenUri doesn't exist", nft.nftContract, tokenId);
        return;
      }
      const ipfsUrl = getCustomIpfsUrl(nftUrl);

      try {
        const response = await axios.get(ipfsUrl);
        const nftData = response.data as NftData;
        setNftData(nftData);
      } catch (err) {
        console.error("IPFS fail: ", err);
        return;
      }
    })();
  }, [nft.id]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    console.log(nft);
    setOnlyBids(false);
    setIsOpen(true);
  }

  const handleOrderCancel = async (id: string) => {
    try {
      const signer = await connector?.getSigner();

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      );

      const cancelTx = await marketPlaceContract.cancelOrder(id);

      await cancelTx.wait();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Buy Modal */}
      <BuyModal
        isOpen={isOpen}
        closeModal={closeModal}
        nft={nft}
        nftName={nftData.name}
        onlyBids={onlyBids}
      />

      <div
        className="card card-compact overflow-hidden card-bordered bg-base-300 col-span-1 relative rounded-lg shadow-md
      hover:shadow-lg hover:cursor-pointer transition-shadow hover:border-gray-300 "
      >
        <div
          className="bg-white bg-opacity-50 backdrop-blur-sm
        absolute top-0 right-0 text-center p-1 rounded-bl-xl
        flex items-center"
        >
          <span className="font-semibold">&nbsp;{nft.copies}</span>
        </div>
        <figure className="min-h-[20rem] max-h-[26rem]">
          <img
            src={getCustomIpfsUrl(nftData.image) ?? ""}
            className="object-cover"
          />
        </figure>

        <div
          className="card-body w-full !p-2 !gap-1 absolute bg-gray-200 
        bg-opacity-70 bottom-0 backdrop-blur-sm"
        >
          <h2 className="card-title">{nftData.name}</h2>
          <div className="divider h-1 m-0 opacity-30" />
          <div className="flex gap-3 items-center justify-between">
            <span className="text-xs">Owner :</span>
            <span className="text-md font-semibold">
              {nft?.seller?.substring(0, 8)}...
              {nft?.seller?.substring(nft.seller.length - 6)}
            </span>
          </div>
          <div className="divider h-1 m-0 opacity-30" />
          {nft.saleType === 2 && (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-xs">Bidding Ends :</p>
                <Countdown
                  key={nft.id}
                  date={Number(nft.endTime)}
                  zeroPadDays={2}
                  autoStart
                  renderer={renderer}
                />
              </div>
              <div className="divider h-1 m-0 opacity-30" />
            </>
          )}
          <div className="flex justify-between items-center gap-2">
            <div className="max-w-[50%] flex-1">
              <p className="text-xs">Price :</p>
              <div className="flex gap-2 items-center mx-1">
                <svg viewBox="0 0 38.4 33.5" className="w-5 h-5">
                  <path
                    fill="#8247E5"
                    d="M29,10.2c-0.7-0.4-1.6-0.4-2.4,0L21,13.5l-3.8,2.1l-5.5,3.3c-0.7,0.4-1.6,0.4-2.4,0L5,16.3   c-0.7-0.4-1.2-1.2-1.2-2.1v-5c0-0.8,0.4-1.6,1.2-2.1l4.3-2.5c0.7-0.4,1.6-0.4,2.4,0L16,7.2c0.7,0.4,1.2,1.2,1.2,2.1v3.3l3.8-2.2V7   c0-0.8-0.4-1.6-1.2-2.1l-8-4.7c-0.7-0.4-1.6-0.4-2.4,0L1.2,5C0.4,5.4,0,6.2,0,7v9.4c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l5.5-3.2l3.8-2.2l5.5-3.2c0.7-0.4,1.6-0.4,2.4,0l4.3,2.5c0.7,0.4,1.2,1.2,1.2,2.1v5c0,0.8-0.4,1.6-1.2,2.1   L29,28.8c-0.7,0.4-1.6,0.4-2.4,0l-4.3-2.5c-0.7-0.4-1.2-1.2-1.2-2.1V21l-3.8,2.2v3.3c0,0.8,0.4,1.6,1.2,2.1l8.1,4.7   c0.7,0.4,1.6,0.4,2.4,0l8.1-4.7c0.7-0.4,1.2-1.2,1.2-2.1V17c0-0.8-0.4-1.6-1.2-2.1L29,10.2z"
                  />
                </svg>
                <span className="text-lg font-semibold proportional-nums truncate">
                  {new Decimal(nft.price ?? 0)
                    .div(new Decimal(10).pow(18))
                    .toString()}
                </span>
              </div>
            </div>
            <div className="flex-1 max-w-[50%] text-end">
              {nft.saleType === 0 ? (
                address &&
                ethers.utils.getAddress(nft.seller) ===
                  ethers.utils.getAddress(address) ? (
                  <button
                    className="btn btn-sm btn-accent normal-case"
                    onClick={() => handleOrderCancel(nft.id)}
                  >
                    Cancel Order
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-primary normal-case"
                    onClick={openModal}
                  >
                    Buy Now
                  </button>
                )
              ) : address &&
                ethers.utils.getAddress(nft.seller) ===
                  ethers.utils.getAddress(address) ? (
                <button
                  className="btn btn-sm btn-accent normal-case"
                  onClick={() => {
                    openModal();
                    setOnlyBids(true);
                  }}
                >
                  Handle Order
                </button>
              ) : Date.now() > nft.endTime ? (
                <button
                  className="btn btn-sm btn-warning normal-case"
                  onClick={() => {
                    openModal();
                    setOnlyBids(true);
                  }}
                >
                  Show Bids
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-secondary normal-case"
                  onClick={openModal}
                >
                  Place Offer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    // Render a completed state
    return <p className="font-semibold text-right"> Order Expired </p>;
  } else {
    // Render a countdown
    return (
      <span className="text-lg font-semibold">
        {String(days).padStart(2, "0")}:{String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    );
  }
};

export default BuyCard;
