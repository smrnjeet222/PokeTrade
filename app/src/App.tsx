import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { Route, Routes } from "react-router-dom";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyCollection from "./pages/MyCollection";
import { MARKETPLACE } from "./contracts";
import useSticky from "./hooks/useSticky";

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

const App = () => {
  const { isSticky } = useSticky();
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="retro">
        <ApolloProvider client={Gclient}>
          <Navbar isSticky={isSticky} />
          <div className="divider mt-0" />
          <div className={`container min-h-screen px-1 pt-16 mx-auto`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/my-collection" element={<MyCollection />} />
            </Routes>
          </div>
        </ApolloProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default App;
