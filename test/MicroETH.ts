
import { ethers, waffle } from 'hardhat';
import { expect } from 'chai';
import { Signer } from 'ethers';
import * as KSink from './util/KSink';
import {waitWalletBalanceChange} from "./util/KSink";

let contractName = "MicroETH";

describe(contractName, function () {

    let contract: any;
    let wallet: Signer;
    let walletAddress: string;

    before(async function() {
        const accounts = await ethers.getSigners();
        wallet = accounts[0];
        walletAddress = (await wallet.getAddress());

        const Contract = await ethers.getContractFactory(contractName, wallet);
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("Should verify that there is no initial supply", async function () {
        let supply = (await contract.totalSupply()).toNumber();
        expect(supply).to.equal(0);
    });

    it("Should check that test wallet #1 contains no METH", async function () {
        let meth = (await contract.balanceOf(walletAddress)).toNumber();
        expect(meth).to.equal(0);
    });

    it("Should issue METH tokens after sending ether to deposit()", async function () {
        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress)).toNumber();

        let tx = (await contract.deposit({value: ethers.utils.parseEther("1.0")}));

        // Check wallet balance
        let match = (await KSink.waitWalletBalanceChange(tx, wallet, startETH, ethers.utils.parseEther("1.0")));
        expect(match).to.be.true;

        // Check METH balance
        let newMETH = (await contract.balanceOf(walletAddress)).toNumber();
        expect(newMETH - startMETH).to.equal(1000000);
    });

    it("Should issue METH tokens after sending ether to fallback", async function () {
        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress)).toNumber();

        let txRequest = {
            to: contract.address,
            value: ethers.utils.parseEther("1.0")
        };
        let tx = wallet.sendTransaction(txRequest);

        // Check wallet balance
        let match = (await KSink.waitWalletBalanceChange(tx, wallet, startETH, ethers.utils.parseEther("1.0")));
        expect(match).to.be.true;

        // Check METH balance
        let newMETH = (await contract.balanceOf(walletAddress)).toNumber();
        expect(newMETH - startMETH).to.equal(1000000);
    });

    // ...
});
