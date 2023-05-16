/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { Cybergirl, CybergirlInterface } from "../Cybergirl";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "safeMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tokenIdCounter",
    outputs: [
      {
        internalType: "uint256",
        name: "_value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080518082018252600981526810de58995c99da5c9b60ba1b602080830191825283518085019094526002845261434760f01b9084015281519192916200005d91600091620000ec565b50805162000073906001906020840190620000ec565b505050620000906200008a6200009660201b60201c565b6200009a565b620001cf565b3390565b600780546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b828054620000fa9062000192565b90600052602060002090601f0160209004810192826200011e576000855562000169565b82601f106200013957805160ff191683800117855562000169565b8280016001018555821562000169579182015b82811115620001695782518255916020019190600101906200014c565b50620001779291506200017b565b5090565b5b808211156200017757600081556001016200017c565b600181811c90821680620001a757607f821691505b60208210811415620001c957634e487b7160e01b600052602260045260246000fd5b50919050565b6117a880620001df6000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c80638da5cb5b116100a2578063b88d4fde11610071578063b88d4fde14610230578063c87b56dd14610243578063d204c45e14610256578063e985e9c514610269578063f2fde38b146102a557600080fd5b80638da5cb5b146101fa57806395d89b411461020b57806398bdf6f514610213578063a22cb4651461021d57600080fd5b806323b872dd116100e957806323b872dd1461019857806342842e0e146101ab5780636352211e146101be57806370a08231146101d1578063715018a6146101f257600080fd5b806301ffc9a71461011b57806306fdde0314610143578063081812fc14610158578063095ea7b314610183575b600080fd5b61012e6101293660046112b3565b6102b8565b60405190151581526020015b60405180910390f35b61014b61030a565b60405161013a9190611328565b61016b61016636600461133b565b61039c565b6040516001600160a01b03909116815260200161013a565b610196610191366004611370565b6103c3565b005b6101966101a636600461139a565b6104de565b6101966101b936600461139a565b61050f565b61016b6101cc36600461133b565b61052a565b6101e46101df3660046113d6565b61058a565b60405190815260200161013a565b610196610610565b6007546001600160a01b031661016b565b61014b610624565b6008546101e49081565b61019661022b3660046113f1565b610633565b61019661023e3660046114b9565b610642565b61014b61025136600461133b565b61067a565b610196610264366004611535565b610685565b61012e610277366004611597565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b6101966102b33660046113d6565b6106bc565b60006001600160e01b031982166380ac58cd60e01b14806102e957506001600160e01b03198216635b5e139f60e01b145b8061030457506301ffc9a760e01b6001600160e01b03198316145b92915050565b606060008054610319906115ca565b80601f0160208091040260200160405190810160405280929190818152602001828054610345906115ca565b80156103925780601f1061036757610100808354040283529160200191610392565b820191906000526020600020905b81548152906001019060200180831161037557829003601f168201915b5050505050905090565b60006103a782610735565b506000908152600460205260409020546001600160a01b031690565b60006103ce8261052a565b9050806001600160a01b0316836001600160a01b031614156104415760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e656044820152603960f91b60648201526084015b60405180910390fd5b336001600160a01b038216148061045d575061045d8133610277565b6104cf5760405162461bcd60e51b815260206004820152603d60248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60448201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c0000006064820152608401610438565b6104d98383610794565b505050565b6104e83382610802565b6105045760405162461bcd60e51b815260040161043890611605565b6104d9838383610881565b6104d983838360405180602001604052806000815250610642565b6000818152600260205260408120546001600160a01b0316806103045760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610438565b60006001600160a01b0382166105f45760405162461bcd60e51b815260206004820152602960248201527f4552433732313a2061646472657373207a65726f206973206e6f7420612076616044820152683634b21037bbb732b960b91b6064820152608401610438565b506001600160a01b031660009081526003602052604090205490565b6106186109e5565b6106226000610a3f565b565b606060018054610319906115ca565b61063e338383610a91565b5050565b61064c3383610802565b6106685760405162461bcd60e51b815260040161043890611605565b61067484848484610b60565b50505050565b606061030482610b93565b61068d6109e5565b600061069860085490565b90506106a8600880546001019055565b6106b28382610c9c565b6104d98183610cb6565b6106c46109e5565b6001600160a01b0381166107295760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610438565b61073281610a3f565b50565b6000818152600260205260409020546001600160a01b03166107325760405162461bcd60e51b8152602060048201526018602482015277115490cdcc8c4e881a5b9d985b1a59081d1bdad95b88125160421b6044820152606401610438565b600081815260046020526040902080546001600160a01b0319166001600160a01b03841690811790915581906107c98261052a565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b60008061080e8361052a565b9050806001600160a01b0316846001600160a01b0316148061085557506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b806108795750836001600160a01b031661086e8461039c565b6001600160a01b0316145b949350505050565b826001600160a01b03166108948261052a565b6001600160a01b0316146108ba5760405162461bcd60e51b815260040161043890611652565b6001600160a01b03821661091c5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610438565b826001600160a01b031661092f8261052a565b6001600160a01b0316146109555760405162461bcd60e51b815260040161043890611652565b600081815260046020908152604080832080546001600160a01b03199081169091556001600160a01b0387811680865260038552838620805460001901905590871680865283862080546001019055868652600290945282852080549092168417909155905184937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b6007546001600160a01b031633146106225760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610438565b600780546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b816001600160a01b0316836001600160a01b03161415610af35760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c6572000000000000006044820152606401610438565b6001600160a01b03838116600081815260056020908152604080832094871680845294825291829020805460ff191686151590811790915591519182527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31910160405180910390a3505050565b610b6b848484610881565b610b7784848484610d50565b6106745760405162461bcd60e51b815260040161043890611697565b6060610b9e82610735565b60008281526006602052604081208054610bb7906115ca565b80601f0160208091040260200160405190810160405280929190818152602001828054610be3906115ca565b8015610c305780601f10610c0557610100808354040283529160200191610c30565b820191906000526020600020905b815481529060010190602001808311610c1357829003601f168201915b505050505090506000610c4e60408051602081019091526000815290565b9050805160001415610c61575092915050565b815115610c93578082604051602001610c7b9291906116e9565b60405160208183030381529060405292505050919050565b61087984610e5d565b61063e828260405180602001604052806000815250610ed1565b6000828152600260205260409020546001600160a01b0316610d315760405162461bcd60e51b815260206004820152602e60248201527f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60448201526d32bc34b9ba32b73a103a37b5b2b760911b6064820152608401610438565b600082815260066020908152604090912082516104d992840190611204565b60006001600160a01b0384163b15610e5257604051630a85bd0160e11b81526001600160a01b0385169063150b7a0290610d94903390899088908890600401611718565b602060405180830381600087803b158015610dae57600080fd5b505af1925050508015610dde575060408051601f3d908101601f19168201909252610ddb91810190611755565b60015b610e38573d808015610e0c576040519150601f19603f3d011682016040523d82523d6000602084013e610e11565b606091505b508051610e305760405162461bcd60e51b815260040161043890611697565b805181602001fd5b6001600160e01b031916630a85bd0160e11b149050610879565b506001949350505050565b6060610e6882610735565b6000610e7f60408051602081019091526000815290565b90506000815111610e9f5760405180602001604052806000815250610eca565b80610ea984610f04565b604051602001610eba9291906116e9565b6040516020818303038152906040525b9392505050565b610edb8383610fa1565b610ee86000848484610d50565b6104d95760405162461bcd60e51b815260040161043890611697565b60606000610f118361112c565b600101905060008167ffffffffffffffff811115610f3157610f3161142d565b6040519080825280601f01601f191660200182016040528015610f5b576020820181803683370190505b5090508181016020015b600019016f181899199a1a9b1b9c1cb0b131b232b360811b600a86061a8153600a8504945084610f9457610f99565b610f65565b509392505050565b6001600160a01b038216610ff75760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f20616464726573736044820152606401610438565b6000818152600260205260409020546001600160a01b03161561105c5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610438565b6000818152600260205260409020546001600160a01b0316156110c15760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006044820152606401610438565b6001600160a01b038216600081815260036020908152604080832080546001019055848352600290915280822080546001600160a01b0319168417905551839291907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b60008072184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b831061116b5772184f03e93ff9f4daa797ed6e38ed64bf6a1f0160401b830492506040015b6d04ee2d6d415b85acef81000000008310611197576d04ee2d6d415b85acef8100000000830492506020015b662386f26fc1000083106111b557662386f26fc10000830492506010015b6305f5e10083106111cd576305f5e100830492506008015b61271083106111e157612710830492506004015b606483106111f3576064830492506002015b600a83106103045760010192915050565b828054611210906115ca565b90600052602060002090601f0160209004810192826112325760008555611278565b82601f1061124b57805160ff1916838001178555611278565b82800160010185558215611278579182015b8281111561127857825182559160200191906001019061125d565b50611284929150611288565b5090565b5b808211156112845760008155600101611289565b6001600160e01b03198116811461073257600080fd5b6000602082840312156112c557600080fd5b8135610eca8161129d565b60005b838110156112eb5781810151838201526020016112d3565b838111156106745750506000910152565b600081518084526113148160208601602086016112d0565b601f01601f19169290920160200192915050565b602081526000610eca60208301846112fc565b60006020828403121561134d57600080fd5b5035919050565b80356001600160a01b038116811461136b57600080fd5b919050565b6000806040838503121561138357600080fd5b61138c83611354565b946020939093013593505050565b6000806000606084860312156113af57600080fd5b6113b884611354565b92506113c660208501611354565b9150604084013590509250925092565b6000602082840312156113e857600080fd5b610eca82611354565b6000806040838503121561140457600080fd5b61140d83611354565b91506020830135801515811461142257600080fd5b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b600067ffffffffffffffff8084111561145e5761145e61142d565b604051601f8501601f19908116603f011681019082821181831017156114865761148661142d565b8160405280935085815286868601111561149f57600080fd5b858560208301376000602087830101525050509392505050565b600080600080608085870312156114cf57600080fd5b6114d885611354565b93506114e660208601611354565b925060408501359150606085013567ffffffffffffffff81111561150957600080fd5b8501601f8101871361151a57600080fd5b61152987823560208401611443565b91505092959194509250565b6000806040838503121561154857600080fd5b61155183611354565b9150602083013567ffffffffffffffff81111561156d57600080fd5b8301601f8101851361157e57600080fd5b61158d85823560208401611443565b9150509250929050565b600080604083850312156115aa57600080fd5b6115b383611354565b91506115c160208401611354565b90509250929050565b600181811c908216806115de57607f821691505b602082108114156115ff57634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252602d908201527f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560408201526c1c881bdc88185c1c1c9bdd9959609a1b606082015260800190565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60208082526032908201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560408201527131b2b4bb32b91034b6b83632b6b2b73a32b960711b606082015260800190565b600083516116fb8184602088016112d0565b83519083019061170f8183602088016112d0565b01949350505050565b6001600160a01b038581168252841660208201526040810183905260806060820181905260009061174b908301846112fc565b9695505050505050565b60006020828403121561176757600080fd5b8151610eca8161129d56fea2646970667358221220e6c4f028075f98ee6494f615ac958989a3a37cb0a829ef4e9212b2bfbea168fd64736f6c63430008090033";

type CybergirlConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: CybergirlConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Cybergirl__factory extends ContractFactory {
  constructor(...args: CybergirlConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<Cybergirl> {
    return super.deploy(overrides || {}) as Promise<Cybergirl>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Cybergirl {
    return super.attach(address) as Cybergirl;
  }
  override connect(signer: Signer): Cybergirl__factory {
    return super.connect(signer) as Cybergirl__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): CybergirlInterface {
    return new utils.Interface(_abi) as CybergirlInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Cybergirl {
    return new Contract(address, _abi, signerOrProvider) as Cybergirl;
  }
}
