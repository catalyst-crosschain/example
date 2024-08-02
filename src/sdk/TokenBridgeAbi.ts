export const TokenBridgeAbi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint16",
          "name": "recipientChain",
          "type": "uint16"
        },
        {
          "internalType": "bytes32",
          "name": "recipient",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "arbiterFee",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "nonce",
          "type": "uint32"
        }
      ],
      "name": "transferTokens",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "sequence",
          "type": "uint64"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    }
  ];