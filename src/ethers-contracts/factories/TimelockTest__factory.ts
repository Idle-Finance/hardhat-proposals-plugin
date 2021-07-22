/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TimelockTest, TimelockTestInterface } from "../TimelockTest";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "delay_",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "CancelTransaction",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "ExecuteTransaction",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "NewAdmin",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "newDelay",
        type: "uint256",
      },
    ],
    name: "NewDelay",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newPendingAdmin",
        type: "address",
      },
    ],
    name: "NewPendingAdmin",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "QueueTransaction",
    type: "event",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    constant: true,
    inputs: [],
    name: "GRACE_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "MAXIMUM_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "MINIMUM_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "acceptAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "cancelTransaction",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "delay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "executeTransaction",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract Administered",
        name: "administered",
        type: "address",
      },
    ],
    name: "harnessAcceptAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address",
      },
    ],
    name: "harnessSetAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "pendingAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "signature",
        type: "string",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "eta",
        type: "uint256",
      },
    ],
    name: "queueTransaction",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "queuedTransactions",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "delay_",
        type: "uint256",
      },
    ],
    name: "setDelay",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "pendingAdmin_",
        type: "address",
      },
    ],
    name: "setPendingAdmin",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516118e03803806118e08339818101604052604081101561003357600080fd5b508051602090910151600080546001600160a01b0319166001600160a01b0390931692909217825560025561187290819061006e90396000f3fe6080604052600436106100e85760003560e01c806372b812b41161008a578063e177246e11610059578063e177246e1461064b578063f2b0653714610675578063f79efaf1146106b3578063f851a440146106e6576100e8565b806372b812b4146105d95780637d645fab1461060c578063b1b43ae514610621578063c1a287e214610636576100e8565b80633a66f901116100c65780633a66f901146102e55780634dd18bf514610444578063591fcdfe146104775780636a42b8f8146105c4576100e8565b80630825f38f146100ea5780630e18b6811461029f57806326782247146102b4575b005b61022a600480360360a081101561010057600080fd5b6001600160a01b0382351691602081013591810190606081016040820135600160201b81111561012f57600080fd5b82018360208201111561014157600080fd5b803590602001918460018302840111600160201b8311171561016257600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156101b457600080fd5b8201836020820111156101c657600080fd5b803590602001918460018302840111600160201b831117156101e757600080fd5b91908080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525092955050913592506106fb915050565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561026457818101518382015260200161024c565b50505050905090810190601f1680156102915780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156102ab57600080fd5b506100e8610c14565b3480156102c057600080fd5b506102c9610cb0565b604080516001600160a01b039092168252519081900360200190f35b3480156102f157600080fd5b50610432600480360360a081101561030857600080fd5b6001600160a01b0382351691602081013591810190606081016040820135600160201b81111561033757600080fd5b82018360208201111561034957600080fd5b803590602001918460018302840111600160201b8311171561036a57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b8111156103bc57600080fd5b8201836020820111156103ce57600080fd5b803590602001918460018302840111600160201b831117156103ef57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295505091359250610cbf915050565b60408051918252519081900360200190f35b34801561045057600080fd5b506100e86004803603602081101561046757600080fd5b50356001600160a01b0316610fd0565b34801561048357600080fd5b506100e8600480360360a081101561049a57600080fd5b6001600160a01b0382351691602081013591810190606081016040820135600160201b8111156104c957600080fd5b8201836020820111156104db57600080fd5b803590602001918460018302840111600160201b831117156104fc57600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295949360208101935035915050600160201b81111561054e57600080fd5b82018360208201111561056057600080fd5b803590602001918460018302840111600160201b8311171561058157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250929550509135925061105e915050565b3480156105d057600080fd5b50610432611314565b3480156105e557600080fd5b506100e8600480360360208110156105fc57600080fd5b50356001600160a01b031661131a565b34801561061857600080fd5b50610432611353565b34801561062d57600080fd5b5061043261135a565b34801561064257600080fd5b50610432611361565b34801561065757600080fd5b506100e86004803603602081101561066e57600080fd5b5035611368565b34801561068157600080fd5b5061069f6004803603602081101561069857600080fd5b503561145d565b604080519115158252519081900360200190f35b3480156106bf57600080fd5b506100e8600480360360208110156106d657600080fd5b50356001600160a01b0316611472565b3480156106f257600080fd5b506102c96114dc565b6000546060906001600160a01b031633146107475760405162461bcd60e51b81526004018080602001828103825260388152602001806115516038913960400191505060405180910390fd5b6000868686868660405160200180866001600160a01b03166001600160a01b031681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b838110156107b657818101518382015260200161079e565b50505050905090810190601f1680156107e35780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b838110156108165781810151838201526020016107fe565b50505050905090810190601f1680156108435780820380516001836020036101000a031916815260200191505b5060408051601f1981840301815291815281516020928301206000818152600390935291205490995060ff1697506108b496505050505050505760405162461bcd60e51b815260040180806020018281038252603d8152602001806116a4603d913960400191505060405180910390fd5b826108bd6114eb565b10156108fa5760405162461bcd60e51b81526004018080602001828103825260458152602001806115f36045913960600191505060405180910390fd5b61090d836212750063ffffffff6114ef16565b6109156114eb565b11156109525760405162461bcd60e51b81526004018080602001828103825260338152602001806115c06033913960400191505060405180910390fd5b6000818152600360205260409020805460ff191690558451606090610978575083610a05565b85805190602001208560405160200180836001600160e01b0319166001600160e01b031916815260040182805190602001908083835b602083106109cd5780518252601f1990920191602091820191016109ae565b6001836020036101000a0380198251168184511680821785525050505050509050019250505060405160208183030381529060405290505b60006060896001600160a01b031689846040518082805190602001908083835b60208310610a445780518252601f199092019160209182019101610a25565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114610aa6576040519150601f19603f3d011682016040523d82523d6000602084013e610aab565b606091505b509150915081610aec5760405162461bcd60e51b815260040180806020018281038252603d815260200180611787603d913960400191505060405180910390fd5b896001600160a01b0316847fa560e3198060a2f10670c1ec5b403077ea6ae93ca8de1c32b451dc1a943cd6e78b8b8b8b604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b83811015610b69578181015183820152602001610b51565b50505050905090810190601f168015610b965780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b83811015610bc9578181015183820152602001610bb1565b50505050905090810190601f168015610bf65780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a39998505050505050505050565b6001546001600160a01b03163314610c5d5760405162461bcd60e51b81526004018080602001828103825260388152602001806116e16038913960400191505060405180910390fd5b60008054336001600160a01b031991821617808355600180549092169091556040516001600160a01b03909116917f71614071b88dee5e0b2ae578a9dd7b2ebbe9ae832ba419dc0242cd065a290b6c91a2565b6001546001600160a01b031681565b600080546001600160a01b03163314610d095760405162461bcd60e51b81526004018080602001828103825260368152602001806117516036913960400191505060405180910390fd5b610d23600254610d176114eb565b9063ffffffff6114ef16565b821015610d615760405162461bcd60e51b81526004018080602001828103825260498152602001806117c46049913960600191505060405180910390fd5b6000868686868660405160200180866001600160a01b03166001600160a01b031681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b83811015610dd0578181015183820152602001610db8565b50505050905090810190601f168015610dfd5780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b83811015610e30578181015183820152602001610e18565b50505050905090810190601f168015610e5d5780820380516001836020036101000a031916815260200191505b5097505050505050505060405160208183030381529060405280519060200120905060016003600083815260200190815260200160002060006101000a81548160ff021916908315150217905550866001600160a01b0316817f76e2796dc3a81d57b0e8504b647febcbeeb5f4af818e164f11eef8131a6a763f88888888604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b83811015610f28578181015183820152602001610f10565b50505050905090810190601f168015610f555780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b83811015610f88578181015183820152602001610f70565b50505050905090810190601f168015610fb55780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a39695505050505050565b33301461100e5760405162461bcd60e51b81526004018080602001828103825260388152602001806117196038913960400191505060405180910390fd5b600180546001600160a01b0319166001600160a01b0383811691909117918290556040519116907f69d78e38a01985fbb1462961809b4b2d65531bc93b2b94037f3334b82ca4a75690600090a250565b6000546001600160a01b031633146110a75760405162461bcd60e51b81526004018080602001828103825260378152602001806115896037913960400191505060405180910390fd5b6000858585858560405160200180866001600160a01b03166001600160a01b031681526020018581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b838110156111165781810151838201526020016110fe565b50505050905090810190601f1680156111435780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b8381101561117657818101518382015260200161115e565b50505050905090810190601f1680156111a35780820380516001836020036101000a031916815260200191505b5097505050505050505060405160208183030381529060405280519060200120905060006003600083815260200190815260200160002060006101000a81548160ff021916908315150217905550856001600160a01b0316817f2fffc091a501fd91bfbff27141450d3acb40fb8e6d8382b243ec7a812a3aaf8787878787604051808581526020018060200180602001848152602001838103835286818151815260200191508051906020019080838360005b8381101561126e578181015183820152602001611256565b50505050905090810190601f16801561129b5780820380516001836020036101000a031916815260200191505b50838103825285518152855160209182019187019080838360005b838110156112ce5781810151838201526020016112b6565b50505050905090810190601f1680156112fb5780820380516001836020036101000a031916815260200191505b50965050505050505060405180910390a3505050505050565b60025481565b6000546001600160a01b0316331461133157600080fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b62278d0081565b6202a30081565b6212750081565b3330146113a65760405162461bcd60e51b815260040180806020018281038252603181526020018061180d6031913960400191505060405180910390fd5b6202a3008110156113e85760405162461bcd60e51b81526004018080602001828103825260348152602001806116386034913960400191505060405180910390fd5b62278d0081111561142a5760405162461bcd60e51b815260040180806020018281038252603881526020018061166c6038913960400191505060405180910390fd5b600281905560405181907f948b1f6a42ee138b7e34058ba85a37f716d55ff25ff05a763f15bed6a04c8d2c90600090a250565b60036020526000908152604090205460ff1681565b806001600160a01b031663e9c714f26040518163ffffffff1660e01b8152600401602060405180830381600087803b1580156114ad57600080fd5b505af11580156114c1573d6000803e3d6000fd5b505050506040513d60208110156114d757600080fd5b505050565b6000546001600160a01b031681565b4290565b600082820183811015611549576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b939250505056fe54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a63616e63656c5472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206973207374616c652e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206861736e2774207375727061737365642074696d65206c6f636b2e54696d656c6f636b3a3a73657444656c61793a2044656c6179206d75737420657863656564206d696e696d756d2064656c61792e54696d656c6f636b3a3a73657444656c61793a2044656c6179206d757374206e6f7420657863656564206d6178696d756d2064656c61792e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e206861736e2774206265656e207175657565642e54696d656c6f636b3a3a61636365707441646d696e3a2043616c6c206d75737420636f6d652066726f6d2070656e64696e6741646d696e2e54696d656c6f636b3a3a73657450656e64696e6741646d696e3a2043616c6c206d75737420636f6d652066726f6d2054696d656c6f636b2e54696d656c6f636b3a3a71756575655472616e73616374696f6e3a2043616c6c206d75737420636f6d652066726f6d2061646d696e2e54696d656c6f636b3a3a657865637574655472616e73616374696f6e3a205472616e73616374696f6e20657865637574696f6e2072657665727465642e54696d656c6f636b3a3a71756575655472616e73616374696f6e3a20457374696d6174656420657865637574696f6e20626c6f636b206d75737420736174697366792064656c61792e54696d656c6f636b3a3a73657444656c61793a2043616c6c206d75737420636f6d652066726f6d2054696d656c6f636b2ea265627a7a7231582068ec5321074ec8daa9f039e745afff22458b2457a3dfb05d84331a522870a7a764736f6c63430005100032";

export class TimelockTest__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    admin_: string,
    delay_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<TimelockTest> {
    return super.deploy(
      admin_,
      delay_,
      overrides || {}
    ) as Promise<TimelockTest>;
  }
  getDeployTransaction(
    admin_: string,
    delay_: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(admin_, delay_, overrides || {});
  }
  attach(address: string): TimelockTest {
    return super.attach(address) as TimelockTest;
  }
  connect(signer: Signer): TimelockTest__factory {
    return super.connect(signer) as TimelockTest__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TimelockTestInterface {
    return new utils.Interface(_abi) as TimelockTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TimelockTest {
    return new Contract(address, _abi, signerOrProvider) as TimelockTest;
  }
}