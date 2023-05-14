import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { Link } from "react-router-dom";

function Navbar({ isSticky }: any) {
  const { isConnected } = useAccount();
  return (
    <div
      className={`p-2 h-20 shadow-sm border-b border-b-base-300 navbar ${
        isSticky ? "navbar-sticky" : "absolute"
      } items-stretch z-50 bg-base-200 bg-opacity-70  
    backdrop-blur-lg text-slate-900`}
    >
      <div className="container m-auto navbar">
        <div className="navbar-start gap-6">
          <Link to="/" className="btn btn-sm normal-case text-md">
            Home
          </Link>
          {isConnected && (
            <Link
              to="/my-collection"
              className="btn btn-sm normal-case text-md"
            >
              My Collection
            </Link>
          )}
        </div>
        <div className="navbar-center">
          <a className="uppercase text-4xl tracking-wider font-black">
            PoPTrade
          </a>
        </div>
        <div className="navbar-end">
          <ConnectKitButton />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
