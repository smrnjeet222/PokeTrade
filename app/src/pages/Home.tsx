import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const Home = () => {
  const { address, connector, isConnecting, isDisconnected, isConnected } =
    useAccount();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connector) return;
    setLoading(true);
    (async () => {
      const signer = await connector?.getSigner();
      setLoading(false);
    })();
  }, [connector]);

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
    <div className={`container m-auto ${loading ? "my-0" : "my-6"}`}>
      {loading && <progress className="progress my-1"></progress>}

      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black">Latest NFTs</h3>
      </div>
      <div className="my-8 grid grid-flow-row gap-6 text-neutral-600 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* {collections.map((c) => (
          <Card key={c} collection={c} />
        ))} */}
      </div>
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black">Ofers Ending Soon </h3>
      </div>
      <div className="my-8 grid grid-flow-row gap-6 text-neutral-600 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* {collections.map((c) => (
          <Card key={c} collection={c} />
        ))} */}
      </div>
    </div>
  );
};

export default Home;
