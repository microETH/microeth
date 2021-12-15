```
                                   _______________   __
      ____ ___  __ _____________  / ____/__  __/ /  / /
     / __  __ \/ / ___/ ___/ __ \/ __/    / / / /__/ /
    / / / / / / / /__/ /  / /_/ / /___   / / / ___  /
   /_/ /_/ /_/_/\___/_/   \____/_____/  /_/ /_/  /_/

```

# microETH (uETH)

Official microETH ERC20 contract scripts.

## What is microETH?

microETH (uETH) is a token representing a single micro unit of Ethereum. The goal of the microETH token project is to make Ethereum easier to use for those who suffer from the psychological effect known as "unit bias". The microETH token value will fluctuate with the price of Ethereum, but should always remain cheap enough that any human can afford to purchase whole units.

### Conversion table

| microETH token | SI units       | ETH            | Gas (Gwei)     | Wei               | Base 10        |
| -------------- | -------------- | -------------- | -------------- | ----------------- | -------------- |
| 1 uETH         | 1 µETH         | 0.000001 ETH   | 1000 gwei      | 1000000000000 wei | 10^12          |

### uETH symbol

uETH (pronounced "you-eeth") is the symbol and nickname for microETH.

It is meant to be synonymous "µETH", without the mixed language interoperability issues.  

## Contract interaction

microETH is compatible with the [ERC20 standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/).

Ethereum can be freely exchanged to microETH (uETH) tokens through contract interaction. For every 0.000001 ETH sent to microETH, the sender will receive 1 uETH token.

### Methods

```
function deposit() external payable nonReentrant;
```
> Exchanges ETH to uETH tokens. Requires a minimum of 0.000001 ETH to create a uETH token.


```
fallback();
```
> Catches ETH sent to the contract. Performs the same action as deposit().

```
function withdraw(uint256 ueth) external nonReentrant
```
> Exchanges uETH tokens to ETH. The exchanged ETH is sent to the caller. If more uETH tokens are requested than the caller account holds, the transaction will be reverted with an error.

## Install

The microETH development environment was built using [Hardhat](https://hardhat.org/) and NodeJS/NPM.

It can run natively on a system with NodeJS/NPM or inside of a sandboxed VM environment.

### Native environment

* Install NodeJS v16 (or newer)
* Install NPM v8 (or newer)
* `cd path/to/microeth`
* `npm install`
* `npx hardhat`
* Create `.env` from `.env.example` with desired configuration

### Sandbox environment (Ubuntu VM)

A sandboxed environment for Mac/Windows/Linux is also included. It contains all the tools necessary to develop microETH. The sandbox works by orchestrating VirtualBox, Vagrant, and Ubuntu's official Vagrant box with a local script, `dev.sh`.

* Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
* Install [Vagrant](https://www.vagrantup.com/downloads)
* **Windows only**: Install [Git Bash](https://gitforwindows.org/)
* **Windows only**: Enable symlinks (see below)
* Open a terminal, run: `bash dev.sh`.

#### Usage

```
bash dev.sh           # (host)  spawn new VM. if the VM exists, a new terminal will be opened instead.
bash dev.sh halt      # (host)  halt the VM.
bash dev.sh destroy   # (host)  destroy the VM.
hardhat <command>     # (guest) shortcut alias for "npx hardhat"
```

#### Windows only: Enable symlinks

This is required because the host project folder is shared with the VM. Hardhat is built on NodeJS which creates a local `node_modules` folder. Inside `node_modules`, files are linked with symlinks. Symlinks are disabled for user accounts by default on Windows. (More info: [Link 1](https://www.speich.net/articles/en/2018/12/24/virtualbox-6-how-to-enable-symlinks-in-a-linux-guest-os/) [Link 2](https://github.com/npm/npm/issues/992#issuecomment-289935776) ).

```
Cmd -> "whoami". Copy user account name.
Run -> "secpol.msc".
Edit "Local Policies" -> "User Rights Assignment" -> "Create symbolic links".
Add user account name and save.
Logoff/login or reboot.
Cmd -> "whoami /priv". If successful, "SeCreateSymbolicLinkPrivilege" will appear in the list. It may show as "Disabled", but that's safe to ignore.
```

## Testing and deployment

See `.env.example` for supported networks.

Example (rinkeby):

* Update `.env` with JSONRPC network configuration (`RINKEBY_URL`, `RINKEBY_PK`, `RINKEBY_TEST_CONTRACT`).
* Test: `npx hardhat test --network rinkeby`
* Deploy: `npx hardhat run --network rinkeby scripts/deploy.ts`
