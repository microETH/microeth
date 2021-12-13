
import { ethers, waffle } from 'hardhat';
import { expect } from 'chai';
import { Signer } from 'ethers';
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

    it("Should verify that there is no initial supply.", async function () {
        let supply = (await contract.totalSupply()).toNumber();
        expect(supply).to.equal(0);
    });

    // ...
});
