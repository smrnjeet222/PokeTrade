import { Dialog, Tab, Transition } from "@headlessui/react";
import axios from "axios";
import Decimal from "decimal.js";
import { Contract, ContractInterface, ethers } from "ethers";
import { Fragment, useEffect, useState } from "react";
import Countdown from "react-countdown";
import { getCustomIpfsUrl } from "../utils/ipfs";
import NFT_ABI from "../contracts/Cybergirl.json";
import { useAccount } from "wagmi";
import { MARKETPLACE, PPT } from "../contracts";
import { PPTicon } from "../App";

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

      const buyTx = await marketPlaceContract.buyNow(nft.id, 0);
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
          readOnly
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
            <PPTicon size={24} />
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

      let price = new Decimal(buyBid);
      price = price.mul(new Decimal(10).pow(18));

      const buyTx = await marketPlaceContract.placeOfferForOrder(
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
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
              selected
                ? "bg-info-content shadow text-neutral-focus"
                : "text-neutral not:disable:hover:bg-white/[0.12] disabled:text-base-300"
            )
          }
          disabled={onlyBids}
        >
          Place Offer
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
              selected
                ? "bg-info-content shadow text-neutral-focus"
                : "text-neutral hover:bg-white/[0.12]"
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
            {new Date(Number(nft.endTime * 100)).toLocaleString()}
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
                  <PPTicon />
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
            {/* <div className="form-control gap-3">
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
                  <PPTicon size={24} />
                </span>
                <span>
                  {new Decimal(buyBid)
                    .mul(new Decimal(buyingQuantity))
                    .toString()}
                </span>
              </label>
            </div> */}
            <br />
            <button
              disabled={buyingState.loading}
              className="retro-btn bg-white w-full disabled:loading"
              onClick={handlePlaceOffer}
            >
              Place Offer
            </button>
          </>
        </Tab.Panel>
        <Tab.Panel className="mt-4">
          <div className="flex flex-col my-4 text-center gap-2 overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="normal-case">Bidder</th>
                  <th className="flex gap-2 items-center normal-case">
                    Price
                    <PPTicon size={16}/>
                  </th>
                  <th className="normal-case">Copies</th>
                  <th className="normal-case text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!nft.bids.length ? (
                  <tr className="border border-base-200 text-error">
                    <td> No Open Bids </td>
                  </tr>
                ) : (
                  nft.bids.map((bid: any) => (
                    <tr key={bid.id} className="border border-base-200">
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
                              className="btn btn-xs btn-secondary normal-case disabled:loading"
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
                                className="btn btn-xs btn-secondary normal-case disabled:loading"
                                disabled={buyingState.loading}
                                onClick={() =>
                                  handleAcceptBid(bid.id.split("-")[1])
                                }
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-xs btn-primary normal-case disabled:loading"
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
          </div>

          {ethers.utils.getAddress(nft.seller) ===
            ethers.utils.getAddress(address!) && (
            <button
              disabled={buyingState.loading}
              className="retro-btn bg-white w-full disabled:loading"
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
      const ipfsUrl = nftUrl;

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
        className="card card-compact overflow-hidden card-bordered bg-base-300 col-span-1 relative rounded-lg shadow-md pb-[5.8rem]
      hover:shadow-lg hover:cursor-pointer transition-shadow hover:border-base-300 "
      >
        {/* <div
          className="bg-base-100 bg-opacity-50 backdrop-blur-sm
        absolute top-0 right-0 text-center p-1 rounded-bl-xl border-l border-b border-base-300
        flex items-center"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
              clipRule="evenodd"
            />
          </svg>

          <span className="text-lg mx-2">&nbsp;{nft.copies}</span>
        </div> */}
        <figure className="aspect-square">
          <img src={nftData.image ?? ""} className="object-cover" />
        </figure>

        <div
          className="card-body w-full !p-2 !gap-1 absolute bg-base-100 
        bg-opacity-70 bottom-0 backdrop-blur-sm"
        >
          <h2 className="card-title items-end justify-between">
            {nftData.name}
            <span className="text-xs">#{nft.tokenId}&nbsp;</span>
          </h2>
          <div className="divider h-1 m-0 opacity-30" />
          <div className="flex gap-3 items-center justify-between">
            <span className="text-xs">Owner :</span>
            <span className="text-md font-semibold">
              {nft?.seller?.substring(0, 8)}...
              {nft?.seller?.substring(nft.seller.length - 6)}
            </span>
          </div>
          <div className="divider h-1 m-0 opacity-30" />
          {nft.saleType === 1 && (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-xs">Bidding Ends :</p>
                <Countdown
                  key={nft.id}
                  date={Number(nft.endTime * 100)}
                  zeroPadDays={2}
                  autoStart
                  renderer={renderer}
                />
              </div>
              <div className="divider h-1 m-0 opacity-30" />
            </>
          )}
          <div className="flex justify-between items-end gap-2">
            <div className="max-w-[50%] flex-1">
              <p className="text-xs">Price :</p>
              <div className="flex gap-2 items-center m-1 mb-0">
                <PPTicon size={24} />
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
                    className="btn btn-sm btn-primary border-primary-focus normal-case"
                    onClick={() => handleOrderCancel(nft.id)}
                  >
                    Cancel Order
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-secondary border-secondary-focus  normal-case"
                    onClick={openModal}
                  >
                    Buy Now
                  </button>
                )
              ) : address &&
                ethers.utils.getAddress(nft.seller) ===
                  ethers.utils.getAddress(address) ? (
                <button
                  className="btn btn-sm btn-accent border-accent-focus normal-case"
                  onClick={() => {
                    openModal();
                    setOnlyBids(true);
                  }}
                >
                  Handle Order
                </button>
              ) : Date.now() / 100 > nft.endTime ? (
                <button
                  className="btn btn-sm btn-warning border-warning-focus normal-case"
                  onClick={() => {
                    openModal();
                    setOnlyBids(true);
                  }}
                >
                  Show Bids
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-secondary border-secondary-focus normal-case"
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
