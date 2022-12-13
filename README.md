# Real Estate Smart Contract for NFT DApp

## Requirements

- Create a local network on MetaMask
- Use the first 5 private keys from the output of `npx hardhat node` to create 5 accounts in MetaMask using the localhost IP address provided in the command.

## Installation

Clone/Download the Repository

```shell
git clone
```

Install Dependencies:

```shell
npm install
```

Run tests

```shell
npx hardhat test
```

Start a local Node and Deploy Contract on local network


```shell
npx hardhat node;

npx hardhat run scripts/deploy.js --network localhost;
```

Run app

```shell
npm run start
```