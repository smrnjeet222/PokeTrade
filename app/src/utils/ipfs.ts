// @ts-ignore
import IPFSGatewayTools from "@pinata/ipfs-gateway-tools/dist/browser";

export const getCustomIpfsUrl = (url: string): string => {
  const gatewayTools = new IPFSGatewayTools();

  const { containsCid, cid } = gatewayTools.containsCID(url)

  if (!containsCid) return url;

  const desiredGatewayPrefix = "https://ipfs.io"

  try {
    const desiredUrl = gatewayTools.convertToDesiredGateway(url, desiredGatewayPrefix)
    return desiredUrl
  } catch (err) {
    console.error(cid, containsCid, err);
    return url;
  }

}