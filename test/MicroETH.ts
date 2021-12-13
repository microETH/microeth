
import { ethers, waffle } from "hardhat";
import { expect } from "chai";
import {BigNumber, Signer} from "ethers";
import * as KSink from "./util/KSink";

let contractName = "MicroETH";

describe(contractName, () => {

    let contract: any;
    let wallet: Signer;
    let walletAddress: string;

    before(async () => {
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

    describe("Initial contract and local wallet states", () => {

        it("Should verify that there is no initial supply", async () => {
            let supply = (await contract.totalSupply()).toNumber();
            expect(supply).to.equal(0);
        });

        it("Should check that test wallet #1 contains no METH", async () => {
            let meth = (await contract.balanceOf(walletAddress)).toNumber();
            expect(meth).to.equal(0);
        });

    });

    //
    // Basic token deposit and withdrawal
    //

    describe("Basic token deposit and withdrawal", () => {

        it("Should issue METH tokens after sending ether to deposit()", async () => {
            let eth = ethers.utils.parseEther("1.0");
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

            expect(temp.eq(newETH)).to.be.true;

            // Check METH balance
            temp = BigNumber.from(newMETH);
            temp = temp.sub(startMETH);

            expect(temp.eq(meth)).to.be.true;
        });

        it("Should issue METH tokens after sending ether to fallback()", async () => {
            let eth = ethers.utils.parseEther("0.5");
            let meth = BigNumber.from("500000");

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

        it("Should issue partial refund when sent ether is not evenly divisible by METH", async () => {
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

        it("Should withdraw all METH tokens and receive ether", async () => {
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
        });

        it("Should validate that total supply matches minted tokens", async () => {
            let expectedSupply = 0;
            let supply = 0;

            // Zero supply
            supply = (await contract.totalSupply()).toNumber();
            expect(supply).to.equal(0);

            // Deposit
            let methValues = [ 1, 2, 99, 100 ];
            for (let i = 0; i < methValues.length; i++) {
                let meth = methValues[i];
                let tx = (await contract.deposit({value: KSink.methToWei(meth)}));
                let txResult = (await KSink.waitWriteMethod(tx));
                expectedSupply += meth;

                supply = (await contract.totalSupply()).toNumber();
                expect(supply).to.equal(expectedSupply);
            }

            // Withdraw
            while (expectedSupply > 0)
            {
                let meth = Math.round(expectedSupply / 2);
                await KSink.waitWriteMethod(contract.withdraw(meth));
                expectedSupply -= meth;

                supply = (await contract.totalSupply()).toNumber();
                expect(supply).to.equal(expectedSupply);
            }

            // Zero supply
            supply = (await contract.totalSupply()).toNumber();
            expect(supply).to.equal(0);
        });

    });

    //
    // Deposit revert cases
    //

    describe("Deposit revert cases", () => {

        it("Should revert when deposit is less than 1 METH", async () => {
            let ethValues = [
                "0.0000009",
                "0.0000005",
                "0.00000001",
                "0.00000000001",
                "0.000000000000000002",
                "0.000000000000000001",
                "0.0",
            ];

            for (let i = 0; i < ethValues.length; i++) {
                let eth = ethers.utils.parseEther(ethValues[i]);
                let txPromise = contract.deposit({value: eth});

                await expect(
                    KSink.waitWriteMethod(txPromise)
                ).to.be.revertedWith("Minimum deposit is 1 METH.");

            };

        });

    });

    //
    // Withdrawal revert cases
    //

    describe("Withdrawal revert cases", () => {

        it("Should revert when withdrawal is less than 1 METH", async () => {
            let txPromise = contract.withdraw(0);
            await expect(
                KSink.waitWriteMethod(txPromise)
            ).to.be.revertedWith("Minimum withdrawal is 1 METH.");
        });

        it("Should revert on insufficient balance", async () => {
            // Deposit
            let meth = 1000000;
            let tx = (await contract.deposit({value: KSink.methToWei(meth)}));
            let txResult = (await KSink.waitWriteMethod(tx));

            // Overdraw
            let txPromise = contract.withdraw(Math.pow(10, 9));
            await expect(
                KSink.waitWriteMethod(txPromise)
            ).to.be.revertedWith("Insufficient balance.");

            // Withdraw remaining
            await KSink.waitWriteMethod(contract.withdraw(meth));
        });


    });

    // ...
});
