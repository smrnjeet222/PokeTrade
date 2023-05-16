import { Dialog, Tab, Transition } from "@headlessui/react";
import axios from "axios";
import { Contract, ContractInterface, ethers } from "ethers";
import { Fragment, useEffect, useState } from "react";
import { getCustomIpfsUrl } from "../utils/ipfs";
import { useAccount } from "wagmi";
import { MARKETPLACE, PPT } from "../contracts";
import Decimal from "decimal.js";
import { PokeMarketPlace } from "../types";
import { PPTicon } from "../App";

export type NftData = {
  name: string;
  image: string;
  description: string;
};

export type NftDetails = {
  id: string;
  balance: string;
  nftUrl: string;
  nftData: NftData;
  price: string;
  seller: string;
  tokenId: number;
  contract: string;
  nftPriceInInr: string;
  nftOnHold: boolean;
  startTime: string;
  endTime: string;
  paymentToken: string;
  saleType: number;
  status: number;
};

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function FixedPriceTab({ nftBalance, tokenId, nft, contract, abi }: any) {
  const { address, connector } = useAccount();

  const [sellPrice, setSellPrice] = useState("0.5");
  const [nftQuantity, setNftQuantity] = useState(1);
  const [isSelling, setIsSelling] = useState(false);

  const handleFixedPriceSell = async () => {
    try {
      setIsSelling(true);
      const signer = await connector?.getSigner();
      const nftContract = new Contract(
        contract,
        abi as ContractInterface,
        signer
      );
      const checkIfApproved = await nftContract.isApprovedForAll(
        address,
        MARKETPLACE.ADDRESS
      );
      if (!checkIfApproved) {
        const approveTx = await nftContract.setApprovalForAll(
          MARKETPLACE.ADDRESS,
          true
        );
        await approveTx.wait();
      }

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      ) as PokeMarketPlace;
      let price = new Decimal(sellPrice);
      price = price.mul(new Decimal(10).pow(18));

      const sellTx = await marketPlaceContract.placeOrderForSell(
        tokenId,
        contract,
        "0",
        price.toString(),
        PPT.ADDRESS,
        "0",
        "0"
      );
      await sellTx.wait();
      setIsSelling(false);
    } catch (Err) {
      setIsSelling(false);
      console.error(Err);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-2">
        <span className="text-sm font-normal">#{tokenId}&nbsp;</span>
        {nft.name}
      </h2>
      <div className="form-control gap-1">
        <label className="flex items-baseline gap-2 font-medium">
          Price <span className="text-xs">(per NFT)</span>
        </label>
        <label className="input-group">
          <span className="">
            <PPTicon />
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={sellPrice}
            onChange={(event) => setSellPrice(event.target.value)}
            placeholder="Enter Price for one item"
            className={`input input-bordered w-full ${
              !sellPrice && "focus:outline-red-400 border-red-500"
            }`}
          />
        </label>
      </div>
      <br />
      {/* <div className="form-control gap-1">
        <label className="flex items-baseline gap-2 font-medium">
          Quantity <span className="text-xs">(max : {nftBalance})</span>
        </label>

        <input
          type="number"
          min={1}
          step={1}
          max={nftBalance}
          value={nftQuantity}
          onChange={(event) =>
            setNftQuantity(
              Math.floor(Math.min(Number(event.target.value), nftBalance)) || 0
            )
          }
          placeholder="Total Quantity"
          className="input input-bordered w-full"
        />
      </div>
      <br /> */}
      <button
        disabled={isSelling || !sellPrice}
        className="retro-btn flex-1 bg-white w-full disabled:loading"
        onClick={handleFixedPriceSell}
      >
        Sell Nft
      </button>
    </>
  );
}

function OpenBidTab({ nftBalance, tokenId, nft, contract, abi }: any) {
  const { address, connector } = useAccount();

  const [sellPrice, setSellPrice] = useState("0.1");
  const [nftQuantity, setNftQuantity] = useState(1);
  const [endTime, setEndTime] = useState("");
  const [isSelling, setIsSelling] = useState(false);

  const handleOpenBidSell = async () => {
    try {
      setIsSelling(true);
      const signer = await connector?.getSigner();
      const nftContract = new Contract(
        contract,
        abi as ContractInterface,
        signer
      );
      const checkIfApproved = await nftContract.isApprovedForAll(
        address,
        MARKETPLACE.ADDRESS
      );
      if (!checkIfApproved) {
        const approveTx = await nftContract.setApprovalForAll(
          MARKETPLACE.ADDRESS,
          true
        );
        await approveTx.wait();
      }

      const marketPlaceContract = new Contract(
        MARKETPLACE.ADDRESS,
        MARKETPLACE.ABI as ContractInterface,
        signer
      ) as PokeMarketPlace;
      let price = new Decimal(sellPrice);
      price = price.mul(new Decimal(10).pow(18));

      const sellTx = await marketPlaceContract.placeOrderForSell(
        tokenId,
        contract,
        "0",
        price.toString(),
        PPT.ADDRESS,
        Date.parse(endTime) / 1000,
        "1"
      );
      await sellTx.wait();
      setIsSelling(false);
    } catch (Err) {
      setIsSelling(false);
      console.error(Err);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-2">
        <span className="text-sm font-normal">#{tokenId}&nbsp;</span>
        {nft.name}
      </h2>
      <div className="form-control gap-1">
        <label className="flex items-baseline gap-2 font-medium">
          Minimum Bid Price <span className="text-xs">(per NFT)</span>
        </label>
        <label className="input-group input-group-md">
          <span className="">
            <PPTicon />
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={sellPrice}
            onChange={(event) => setSellPrice(event.target.value)}
            placeholder="Enter min price for one item"
            className={`input input-bordered w-full ${
              !sellPrice && "focus:outline-red-400 border-red-500"
            }`}
          />
        </label>
      </div>
      <br />
      {/* <div className="form-control gap-1">
        <label className="flex items-baseline gap-2 font-medium">
          Quantity <span className="text-xs">(max : {nftBalance})</span>
        </label>
        <input
          type="number"
          min={1}
          step={1}
          max={nftBalance}
          value={nftQuantity}
          onChange={(event) =>
            setNftQuantity(
              Math.floor(Math.min(Number(event.target.value), nftBalance)) || 0
            )
          }
          placeholder="Total Quantity"
          className="input input-sm input-bordered w-full"
        />
      </div>
      <br /> */}
      <div className="form-control gap-1">
        <label className="flex items-baseline gap-2 font-medium">
          Bid End Date/Time <span className="text-xs">(TimeZone is Local)</span>
        </label>
        <input
          type="datetime-local"
          min={
            new Date().toISOString().split("T")[0] +
            "T" +
            new Date().getHours() +
            ":" +
            new Date().getMinutes()
          }
          onChange={(event) => setEndTime(event.target.value)}
          value={endTime}
          placeholder="Expiration Date-Time"
          className="input input-sm input-bordered w-full"
        />
      </div>
      <br />
      <button
        disabled={isSelling || !sellPrice}
        className="retro-btn bg-white w-full disabled:loading"
        onClick={handleOpenBidSell}
      >
        Sell Nft
      </button>
    </>
  );
}

function SellModal({
  isOpen,
  closeModal,
  nftBalance,
  tokenId,
  nft,
  contract,
  abi,
}: any) {
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
                className="w-max min-w-[40vw] transform overflow-hidden rounded-2xl
              bg-base-100 p-6 text-left align-middle shadow-xl transition-all
              "
              >
                <button
                  className="btn btn-circle btn-xs btn-error absolute top-1 right-1 "
                  onClick={closeModal}
                >
                  <svg width={8} height={8} fill="none">
                    <path
                      fill="#fff"
                      d="M7.754 7.754a.838.838 0 0 1-1.185 0L4 5.186 1.431 7.754A.838.838 0 0 1 .246 6.57L2.814 4 .246 1.431A.838.838 0 1 1 1.43.246L4 2.814 6.569.246A.838.838 0 0 1 7.754 1.43L5.186 4l2.568 2.569a.838.838 0 0 1 0 1.185Z"
                    />
                  </svg>
                </button>
                <Tab.Group>
                  <Tab.List className="flex space-x-1 rounded-xl bg-base-200/50 p-1">
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
                      Fixed Price
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ",
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
                    <Tab.Panel className="mt-4 text-center">
                      <FixedPriceTab
                        nftBalance={nftBalance}
                        nft={nft}
                        tokenId={tokenId}
                        contract={contract}
                        abi={abi}
                      />
                    </Tab.Panel>
                    <Tab.Panel className="mt-4 text-center">
                      <OpenBidTab
                        nftBalance={nftBalance}
                        nft={nft}
                        tokenId={tokenId}
                        contract={contract}
                        abi={abi}
                      />
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function SellCard({ nftData, contract, abi }: any) {
  const { address, connector } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      {/* SELL MODAL */}
      <SellModal
        isOpen={isOpen}
        closeModal={closeModal}
        nft={nftData}
        nftBalance={nftData.balance}
        tokenId={nftData.tokenId}
        contract={contract}
        abi={abi}
      />

      {/* Card  */}
      <div
        className="card card-compact overflow-hidden card-bordered bg-base-300 col-span-1 relative rounded-lg shadow-md
        pb-[4.5rem] hover:shadow-lg hover:cursor-pointer transition-shadow hover:border-base-300"
      >
        <figure className="aspect-square">
          <img src={nftData.image} className="object-cover" />
        </figure>
        <div
          className="card-body w-full !p-4 !pt-2 !gap-1 absolute bg-base-100 
        bg-opacity-70 bottom-0 backdrop-blur-sm "
        >
          <h2 className="card-title items-baseline">
            <span className="text-xs">#{nftData.tokenId}&nbsp;</span>
            {nftData.name}
          </h2>
          {/* <h4 className="text-sm">
            Quantity : <span className="font-semibold">{nftBalance}</span>
          </h4> */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={openModal}
              className="retro-btn flex-1 bg-white mt-3 normal-case"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SellCard;
