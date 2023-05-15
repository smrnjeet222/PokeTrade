import MarketPlace from "./PokeMarketPlace.json"
import ppt from "./erc20.json"

export const MARKETPLACE = {
  ADDRESS: "0x5c8235448844795153373bCb454E809d85f8411a",
  ABI: MarketPlace.abi,
  SUB_GRAPH_URL: "https://api.thegraph.com/subgraphs/name/smrnjeet222/pop-marketplace"
}

export const PPT = {
  ADDRESS: "0x733710c0d208de9d9b641c2747eba1ebbab108ce",
  ABI: ppt.abi,
  // SUB_GRAPH_URL: "https://api.thegraph.com/subgraphs/name/smrnjeet222/pop-marketplace"
}
