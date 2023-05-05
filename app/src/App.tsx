import { ConnectKitProvider, getDefaultClient } from "connectkit";
import { Route, Routes } from "react-router-dom";
import {
  WagmiConfig,
  configureChains,
  createClient,
} from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

const { provider } = configureChains([polygonMumbai], [publicProvider()]);

const client = createClient(
  getDefaultClient({
    appName: "PokeTrade",
    autoConnect: true,
    provider,
    chains: [polygonMumbai]
  })
);

const App = () => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="retro">
        <Navbar />
        <div className="divider my-0" />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default App;
