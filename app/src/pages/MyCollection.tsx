import { Contract, ContractInterface } from "ethers";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getCustomIpfsUrl } from "../utils/ipfs";
import NFT_ABI from "../contracts/PokeCardERC1155.json";
import SellCard from "../components/SellCard";

const MyCollection = () => {
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
  if (isDisconnected || !connector)
    return (
      <div className="container text-center m-auto my-4 text-4xl">
        Disconnected
      </div>
    );
  const [userTokens, setUserTokens] = useState<any>({});
  const [uiState, setUiState] = useState<any>({
    loadingNftBalance: false,
    errorNftBalance: null,
  });
  const getMetadata = async (tokenId: number) => {
    try {
      const signer = await connector.getSigner();
      const contract = new Contract(
        "0x8F8A6e7Eaf05eB72f9e8A8c351e00DA5a54cE305",
        NFT_ABI.abi as ContractInterface,
        signer
      );

      const balance = Number(await contract.balanceOf(address, tokenId));
      if (balance) {
        const tokenURI = getCustomIpfsUrl(await contract.tokenURI(tokenId));
        if (tokenURI) {
          const resp = await (await fetch(tokenURI)).json();
          return {
            ...resp,
            tokenId,
            balance,
            image: getCustomIpfsUrl(resp.image),
          };
        } else {
          return {
            tokenId,
            balance,
            error: "TokenURI missing",
          };
        }
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

  const getTokenId = async () => {
    const signer = await connector.getSigner();
    const contract = new Contract(
      "0x8F8A6e7Eaf05eB72f9e8A8c351e00DA5a54cE305",
      NFT_ABI.abi as ContractInterface,
      signer
    );

    const currentTokenID = Number(await contract._currentTokenID());
    return currentTokenID;
  };

  useEffect(() => {
    setUiState((p: any) => ({
      ...p,
      loadingNftBalance: true,
    }));

    (async () => {
      if (isConnected && address) {
        try {
          const tokenId = await getTokenId();
          const BATCH_SIZE = 6;
          const NO_OF_BATCHES = Math.ceil((tokenId || 1) / BATCH_SIZE) ?? 4;
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
          <h1 className="text-5xl font-bold">Your Poke NFT Collection</h1>
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
              nftBalance={userTokens[idx].balance}
              tokenId={userTokens[idx].tokenId}
              contract={"0x8F8A6e7Eaf05eB72f9e8A8c351e00DA5a54cE305"}
              abi={NFT_ABI.abi}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCollection;
