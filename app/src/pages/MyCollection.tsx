import { Contract, ContractInterface, ethers } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getCustomIpfsUrl } from "../utils/ipfs";
import NFT_ABI from "../contracts/Cybergirl.json";
import SellCard from "../components/SellCard";

const MyCollection = () => {
  const { address, connector, isConnected } = useAccount();

  const [userTokens, setUserTokens] = useState<any>({});
  const [uiState, setUiState] = useState<any>({
    loadingNftBalance: false,
    errorNftBalance: null,
  });
  const getMetadata = async (tokenId: number) => {
    try {
      const signer = await connector?.getSigner();
      const contract = new Contract(
        "0x75362d43640cfE536520448Ba2407aDA56CD64dc",
        NFT_ABI.abi as ContractInterface,
        signer
      );

      const isOwner =
        (await contract.ownerOf(tokenId)).toLowerCase() ===
        address?.toLowerCase();
      if (isOwner) {
        const tokenURI = await contract.tokenURI(tokenId);
        const resp = await (await fetch(tokenURI)).json();
        return {
          ...resp,
          tokenId,
          balance: 1,
          // name: resp.name.slice(0, -4),
        };
      }
    } catch (err) {
      console.error(err);
      setUiState((p: any) => ({
        ...p,
        errorNftBalance: `${err}`,
      }));
      return null;
    }
  };

  useEffect(() => {
    setUiState((p: any) => ({
      ...p,
      loadingNftBalance: true,
    }));

    (async () => {
      if (isConnected && address) {
        try {
          const tokenId = 100;
          const BATCH_SIZE = 5;
          const NO_OF_BATCHES = Math.ceil(tokenId / BATCH_SIZE) ?? 4;
          const SKIP_LAST_BATCHES = 0;
          const tkns: any = {};
          for (let b = NO_OF_BATCHES; b >= SKIP_LAST_BATCHES + 1; b--) {
            const allData = await Promise.all(
              [...Array(BATCH_SIZE).keys()].map(async (i) => {
                return await getMetadata(BATCH_SIZE * b - i - 1);
              })
            );
            for (const data of allData) {
              if (data) {
                tkns[NO_OF_BATCHES * BATCH_SIZE - data?.tokenId] = data;
              }
            }
            setUserTokens({ ...tkns });
          }
        } catch (err) {
          setUiState((p: any) => ({
            ...p,
            errorNftBalance: `${err}`,
            loadingNftBalance: false,
          }));
          return;
        }
      } else {
        setUserTokens({});
      }
      setUiState((p: any) => ({
        ...p,
        errorNftBalance: null,
        loadingNftBalance: false,
      }));
    })();
  }, [isConnected, address]);

  return (
    <div className="container m-auto">
      <div className="hero p-10">
        <div className="hero-content flex-col text-center">
          <h1 className="text-5xl font-bold">Your P0P Collection</h1>
          <div className="text-sm breadcrumbs">
            <ul>
              <li>Home</li>
              <li>Collection</li>
            </ul>
          </div>
          <p className="text-lg text-black truncate">{address}</p>
        </div>
      </div>
      <div>
        {uiState.loadingNftBalance ? (
          <progress className="progress progress-secondary w-full"></progress>
        ) : (
          <div className="text-center text-2xl text-error">
            {!Object.keys(userTokens).length && (
              <div className="-mb-10">No NFTs</div>
            )}
          </div>
        )}
        {uiState.errorNftBalance && (
          <h4 className="text-2xl text-red-500 truncate">
            {uiState.errorNftBalance}
          </h4>
        )}
        <div className="grid gap-4 grid-cols-2 grid-flow-dense my-8 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Object.keys(userTokens).map((idx) => (
            <SellCard
              key={idx}
              nftData={userTokens[idx]}
              contract={"0x75362d43640cfE536520448Ba2407aDA56CD64dc"}
              abi={NFT_ABI.abi}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCollection;
