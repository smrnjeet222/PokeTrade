import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { Route, Routes } from "react-router-dom";
import { WagmiConfig, configureChains, createClient, useAccount } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Navbar from "./components/Navbar";
import { MARKETPLACE } from "./contracts";
import useSticky from "./hooks/useSticky";
import Home from "./pages/Home";
import MyCollection from "./pages/MyCollection";
import { ReactNode } from "react";

const { provider } = configureChains([polygonMumbai], [publicProvider()]);

const client = createClient(
  getDefaultClient({
    appName: "PokeTrade",
    autoConnect: true,
    provider,
    chains: [polygonMumbai],
  })
);

const Gclient = new ApolloClient({
  uri: MARKETPLACE.SUB_GRAPH_URL,
  cache: new InMemoryCache(),
});

const Layout = (props: { children: ReactNode }) => {
  const { connector, isConnecting, isDisconnected } = useAccount();

  if (isConnecting)
    return (
      <div className="container text-center m-auto my-4 pt-16 text-4xl">
        Connecting...
      </div>
    );
  if (isDisconnected || !connector)
    return (
      <div className="container text-center m-auto my-4 pt-16 text-4xl">
        Disconnected
      </div>
    );

  return (
    <div className={`container min-h-screen px-1 pt-16 mx-auto`}>
      {props.children}
    </div>
  );
};

const App = () => {
  const { isSticky } = useSticky();
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="retro">
        <ApolloProvider client={Gclient}>
          <Navbar isSticky={isSticky} />
          <div className="divider mt-0" />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-collection" element={<MyCollection />} />
            </Routes>
          </Layout>
        </ApolloProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export const PPTicon = ({ size }: any) => {
  return (
    <svg
      width={size ?? "32"}
      height={size ?? "32"}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 0C7.17571 0 0 7.17571 0 16C0 24.8243 7.17571 32 16 32C24.8243 32 32 24.8243 32 16C32 7.17571 24.8243 0 16 0Z"
        fill="#F2F1FE"
      />
      <path
        d="M17.3219 7.97998H11.2453C10.0825 7.97998 9.13477 8.92772 9.13477 10.0905V21.7182C9.13477 22.8809 10.0825 23.8287 11.2453 23.8287H14.1602C15.3229 23.8287 16.2707 22.8809 16.2707 21.7182V20.1492H17.3219C20.6828 20.1492 23.4065 17.4255 23.4065 14.0646C23.3986 10.7117 20.6828 7.97998 17.3219 7.97998ZM18.4051 16.191C17.2264 16.191 16.2786 15.2353 16.2786 14.0646C16.2786 12.8859 17.2343 11.9382 18.4051 11.9382C19.5837 11.9382 20.5315 12.8939 20.5315 14.0646C20.5315 15.2353 19.5758 16.191 18.4051 16.191Z"
        fill="#5A4CF3"
      />
      <path
        d="M22.0606 21.3438C21.32 21.3438 20.7227 21.9411 20.7227 22.6817C20.7227 23.4224 21.32 24.0197 22.0606 24.0197C22.8013 24.0197 23.3986 23.4224 23.3986 22.6817C23.3986 21.949 22.8013 21.3438 22.0606 21.3438Z"
        fill="#5A4CF3"
      />
    </svg>
  );
};

export default App;
