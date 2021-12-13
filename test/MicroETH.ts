
import { ethers, waffle } from 'hardhat';
import { expect } from 'chai';
import { Signer } from 'ethers';
import * as KSink from './util/KSink';

let contractName = 'MicroETH';

describe(contractName, function () {

    let contract: any;
    let wallet: Signer;
    let walletAddress: string;
    let deploymentOnly = false; // Measure constructor gas, then exit

    before(async function() {
        const accounts = await ethers.getSigners();
        wallet = accounts[0];
        walletAddress = (await wallet.getAddress());

        const Contract = await ethers.getContractFactory(contractName, wallet);
        contract = await Contract.deploy();
        await contract.deployed();
    });

    it("Should test the compilation", async function () {
        let x = (await contract.getX()).toNumber();
        expect(x).to.equal(456);
    });

    if (deploymentOnly) {
        return;
    }

    // ...
});
