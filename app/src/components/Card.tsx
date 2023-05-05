import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

function Card(props: any) {
  const { address, connector } = useAccount();
  const [data, setData] = useState<any>({});
  const [coverImage, setCoverImage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="my-2 border-2 rounded-md border-black
      hover:scale-105 duration-300 overflow-hidden
      shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
    >
      <figure>
        <img
          src={loading ? "/loader.svg" : coverImage || "/logo.png"}
          className="cursor-pointer hover:scale-110 duration-300 w-full object-cover border-b-2 border-black"
          // onClick={() => navigate(`/collection/${collection}`)}
        />

        <figcaption className="p-4">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-semibold">Name</span>{" "}
            <span className="font-mono">-</span>
          </div>
          <p className="mb-3">Size: -</p>

          <button
            className="retro-btn w-full"
            // onClick={() => navigate(`/collection/${collection}`)}
          >
            Work&nbsp;on&nbsp;Grid
          </button>
        </figcaption>
      </figure>
    </div>
  );
}

export default Card;
