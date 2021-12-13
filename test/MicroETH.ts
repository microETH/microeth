
import { ethers, waffle } from 'hardhat';
import { expect } from 'chai';
import {BigNumber, Signer} from 'ethers';
import * as KSink from './util/KSink';

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

    //
    // Initial contract and local wallet states
    //

    it("Should verify that there is no initial supply", async function () {
        let supply = (await contract.totalSupply()).toNumber();
        expect(supply).to.equal(0);
    });

    it("Should check that test wallet #1 contains no METH", async function () {
        let meth = (await contract.balanceOf(walletAddress)).toNumber();
        expect(meth).to.equal(0);
    });

    //
    // Basic token deposit and withdrawal
    //

    it("Should issue METH tokens after sending ether to deposit()", async function () {

        let eth = ethers.utils.parseEther("1.0");
        let meth = BigNumber.from('1000000');

        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress));

        let tx = (await contract.deposit({value: eth}));
        let txResult = (await KSink.waitWriteMethod(tx));

        let newETH = (await wallet.getBalance());
        let newMETH = (await contract.balanceOf(walletAddress));

        let temp = null;

        // Check wallet balance
        temp = BigNumber.from(startETH);
        temp = temp.sub(txResult.gasTotal);
        temp = temp.sub(eth);

        expect(temp.eq(newETH)).to.be.true;

        // Check METH balance
        temp = BigNumber.from(newMETH);
        temp = temp.sub(startMETH);

        expect(temp.eq(meth)).to.be.true;
    });

    it("Should issue METH tokens after sending ether to fallback()", async function () {

        let eth = ethers.utils.parseEther("0.5");
        let meth = BigNumber.from('500000');

        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress));

        let txRequest = {
            to: contract.address,
            value: eth
        };
        let tx = wallet.sendTransaction(txRequest);
        let txResult = (await KSink.waitWriteMethod(tx));

        let newETH = (await wallet.getBalance());
        let newMETH = (await contract.balanceOf(walletAddress));

        let temp = null;

        // Check wallet balance
        temp = BigNumber.from(startETH);
        temp = temp.sub(txResult.gasTotal);
        temp = temp.sub(eth);

        expect(temp.eq(newETH)).to.be.true;

        // Check METH balance
        temp = BigNumber.from(newMETH);
        temp = temp.sub(startMETH);

        expect(temp.eq(meth)).to.be.true;
    });

    it("Should issue partial refund when sent ether is not evenly divisible by METH", async function () {

        let partialWei = BigNumber.from("32000");
        let eth = ethers.utils.parseEther("1.0").add(partialWei);
        let meth = BigNumber.from("1000000");

        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress));

        let tx = (await contract.deposit({value: eth}));
        let txResult = (await KSink.waitWriteMethod(tx));

        let newETH = (await wallet.getBalance());
        let newMETH = (await contract.balanceOf(walletAddress));

        let temp = null;

        // Check wallet balance
        temp = BigNumber.from(startETH);
        temp = temp.sub(txResult.gasTotal);
        temp = temp.sub(eth);
        temp = temp.add(partialWei);

        expect(temp.eq(newETH)).to.be.true;

        // Check METH balance
        temp = BigNumber.from(newMETH);
        temp = temp.sub(startMETH);

        expect(temp.eq(meth)).to.be.true;
    });

    it("Should withdraw all METH tokens and receive ether", async function () {

        let startETH = (await wallet.getBalance());
        let startMETH = (await contract.balanceOf(walletAddress));

        let tx = (await contract.withdraw(startMETH));
        let txResult = (await KSink.waitWriteMethod(tx));

        let newETH = (await wallet.getBalance());
        let newMETH = (await contract.balanceOf(walletAddress));

        let temp = null;

        // Check wallet balance
        temp = BigNumber.from(startETH);
        temp = temp.sub(txResult.gasTotal);
        temp = temp.add(KSink.methToWei(startMETH));

        expect(temp.eq(newETH)).to.be.true;

        // Check METH balance
        expect(startMETH.gt("0")).to.be.true;
        expect(newMETH.eq("0")).to.be.true;

        return true;
    });

    //
    // Deposit revert cases
    //

    // TODO: FILL ME IN

    //
    // Withdrawal revert cases
    //

    // TODO: FILL ME IN



    // ...
});
