```
       __  ____                 _______________   __
      /  |/  /_______________  / ____/__  __/ /  / /
     / /|_/ / / ___/ ___/ __ \/ __/    / / / /__/ /
    / /  / / / /__/ /  / /_/ / /___   / / / ___  /
   /_/  /_/_/\___/_/   \____/_____/  /_/ /_/  /_/

```

# MicroETH (METH)

Official microETH ERC20 contract scripts.

## Contract interaction

TODO: deposit/withdrawal

## Install

The microETH development environment was built using [Hardhat](https://hardhat.org/) and NodeJS/NPM.

It can be run natively on a system with NodeJS/NPM or inside of a sandboxed VM environment.

### Native environment

* Install NodeJS v16 (or newer)
* Install NPM v8 (or newer)
* `cd path/to/microeth`
* `npm install`
* `npx hardhat`
* Create `.env` from `.env.example` with desired configuration

### Sandbox environment (Ubuntu VM)

A sandboxed environment for Mac/Windows/Linux is also included. It contains all of the tools necessary to develop microETH. The sandbox works by orchestrating VirtualBox, Vagrant, and Ubuntu's official Vagrant box with a local script, `dev.sh`.

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

## Deployment

TODO: deployment
