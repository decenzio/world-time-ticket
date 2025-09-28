# Contracts

This folder contains the Solidity contracts and a Makefile to build and deploy.

Quick usage

1. Copy `contracts/.env.example` to `contracts/.env` and fill RPC_URL, PRIVATE_KEY, OWNER.
2. Build: cd contracts && make build
3. Dry-run deploy (prints command): cd contracts && make deploy-dry
4. Deploy: cd contracts && make deploy

Why your `forge build` might fail

- This repository includes a local copy of OpenZeppelin under `contracts/lib/openzeppelin-contracts-upgradeable/`.
- That OpenZeppelin copy includes many test files that depend on `forge-std` and other tooling. If `forge-std` is not installed, Foundry will error when compiling the OpenZeppelin tests.

How to fix missing dependencies (recommended)

1. Install `forge-std` and the canonical OpenZeppelin package using Foundry's package manager from the repo root:

   forge install foundry-rs/forge-std
   forge install OpenZeppelin/openzeppelin-contracts-upgradeable

   These will add small packages and update `remappings.txt` so imports like `@openzeppelin/contracts/...` resolve properly.

2. After installing, build from the `contracts/` folder:

   cd contracts
   forge build

Alternative: prune local OpenZeppelin tests

- If you prefer not to install extra packages, remove or move the `test/` folders from `contracts/lib/openzeppelin-contracts-upgradeable/` so Foundry does not try to compile the bundled tests.

Notes about the Makefile

- The Makefile uses `forge create` and `cast` (ensure Foundry is installed).
- It sources `contracts/.env` (not the repo root `.env`) to keep deployment credentials local to the contracts folder.

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
