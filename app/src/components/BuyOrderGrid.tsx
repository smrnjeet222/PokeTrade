import { useQuery } from "@apollo/client";
import BuyCard from "./BuyCard";
// import BuyCard from "../common/BuyCard";

function BuyOrderGrid({ gql }: any) {
  const { data, loading, error } = useQuery(gql);

  return (
    <>
      {loading ? (
        <progress className="progress"></progress>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 m-1">
          {data?.orders?.map((nft: any, idx: any) => (
            <BuyCard key={idx} nft={nft} />
          ))}
        </div>
      )}
    </>
  );
}

export default BuyOrderGrid;
