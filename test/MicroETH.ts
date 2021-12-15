
import { ethers, waffle } from "hardhat";
import * as hre from "hardhat";
import { expect } from "chai";
import {BigNumber, Signer} from "ethers";
import * as KSink from "./util/KSink";
import {
    etherToUETH,
    TestWallet,
    uethTokenToWei,
    uethToUETHToken,
    writeResultContainsEvent
} from "./util/KSink";
import { ChainID } from "../scripts/microeth/Constants";

let contractName = "MicroETH";

describe(contractName, function() {

    //let contract: any;
    let chainId = <number>ChainID.Unknown;
    let wallets: TestWallet[] = []; // 0 = deploy wallet, 1 = transfer pair #1, 2 = transfer pair #2

    before(async function() {
        // Check network
        chainId = <number>hre.network.config.chainId;

        let supportedNetworks = [ChainID.Hardhat, ChainID.Ropsten, ChainID.Rinkeby];
        if (supportedNetworks.find((element) => { return element == chainId }) === undefined) {
            throw new Error("Unsupported network.");
        }

        // Lookup wallets and bind them to the network
        if (chainId == ChainID.Hardhat) {
            const accounts = await ethers.getSigners();
            if (accounts.length < 3) {
                throw new Error("Need more wallets from HH runtime (have " + accounts.length  + ").");
            }

            const contractFactory = await ethers.getContractFactory(contractName, accounts[0]);
            let tx = await contractFactory.deploy();
            let contract = (await tx.deployed());

            wallets.push({
                wallet: accounts[0],
                address: (await accounts[0].getAddress()),
                contract: contract
            });
            wallets.push({
                wallet: accounts[1],
                address: (await accounts[1].getAddress()),
                contract: contract.connect(accounts[1])
            });
            wallets.push({
                wallet: accounts[2],
                address: (await accounts[2].getAddress()),
                contract: contract.connect(accounts[2])
            });
        }
        else {
            const accounts = await ethers.getSigners();
            if (accounts.length < 1) {
                throw new Error("Need more wallets defined.");
            }

            let contractAddress = "";
            let userConf = <any>hre.network.config;
            if (userConf.hasOwnProperty("testContract") && userConf.testContract !== undefined) {
                contractAddress = userConf.testContract;
            }
            if (contractAddress.length == 0) {
                throw new Error("Invalid test contract.");
            }

            const contractFactory = await ethers.getContractFactory(contractName);
            let contract = new ethers.Contract(contractAddress, contractFactory.interface, accounts[0]);

            wallets.push({
                wallet: accounts[0],
                address: (await accounts[0].getAddress()),
                contract: contract
            });
        }
    });

    //
    // Initial contract and local wallet states
    //

    describe("Initial contract and local wallet states", function() {

        it("Should verify that there is no initial supply", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let supply = (await wallets[0].contract.totalSupply());
            expect(supply.eq(0)).to.be.true;
        });

        it("Should check that test wallet #1 contains no uETH", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            let ueth = (await wallets[0].contract.balanceOf(wallets[0].address));
            expect(ueth.eq(0)).to.be.true;
        });

    });

    //
    // Metadata validation
    //

    describe("Metadata validation", function() {

        it("Name match", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            expect(await wallets[0].contract.name()).to.equal("microETH");
        });

        it("Symbol match", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            expect(await wallets[0].contract.symbol()).to.equal("uETH");
        });

        it("Decimal match", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            expect(await wallets[0].contract.decimals()).to.equal(18);
        });

    });

    //
    // Basic token deposit and withdrawal
    //

    describe("Basic token deposit and withdrawal", function() {

        it("Should issue uETH tokens after sending ether to deposit()", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            let ether = "0.0001"; // 100 uETH
            let eth = ethers.utils.parseEther(ether);
            let ueth = KSink.uethToUETHToken(KSink.etherToUETH(ether));

            let startETH = (await wallets[0].wallet.getBalance());
            let startUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let tx = (await wallets[0].contract.deposit({value: eth}));
            let txResult = (await KSink.waitWriteMethod(tx));

            let newETH = (await wallets[0].wallet.getBalance());
            let newUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let temp: any = null;

            // Check wallet balance
            temp = BigNumber.from(startETH);
            temp = temp.sub(txResult.gasTotal);
            temp = temp.sub(eth);

            expect(temp.eq(newETH)).to.be.true;

            // Check uETH balance
            temp = BigNumber.from(newUETH);
            temp = temp.sub(startUETH);

            expect(temp.eq(ueth)).to.be.true;
        });

        it("Should issue uETH tokens after sending ether to fallback()", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            let ether = "0.0002"; // 200 uETH
            let eth = ethers.utils.parseEther(ether);
            let ueth = KSink.uethToUETHToken(KSink.etherToUETH(ether));

            let startETH = (await wallets[0].wallet.getBalance());
            let startUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let txRequest = {
                to: wallets[0].contract.address,
                value: eth
            };
            let tx = wallets[0].wallet.sendTransaction(txRequest);
            let txResult = (await KSink.waitWriteMethod(tx));

            let newETH = (await wallets[0].wallet.getBalance());
            let newUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let temp = null;

            // Check wallet balance
            temp = BigNumber.from(startETH);
            temp = temp.sub(txResult.gasTotal);
            temp = temp.sub(eth);

            expect(temp.eq(newETH)).to.be.true;

            // Check uETH balance
            temp = BigNumber.from(newUETH);
            temp = temp.sub(startUETH);

            expect(temp.eq(ueth)).to.be.true;
        });

        it("Should withdraw all uETH tokens and receive ether", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            let startETH = (await wallets[0].wallet.getBalance());
            let startUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let tx = (await wallets[0].contract.withdraw(startUETH));
            let txResult = (await KSink.waitWriteMethod(tx));

            let newETH = (await wallets[0].wallet.getBalance());
            let newUETH = (await wallets[0].contract.balanceOf(wallets[0].address));

            let temp = null;

            // Check wallet balance
            temp = BigNumber.from(startETH);
            temp = temp.sub(txResult.gasTotal);
            temp = temp.add(KSink.uethTokenToWei(startUETH));

            expect(temp.eq(newETH)).to.be.true;

            // Check uETH balance
            expect(startUETH.gt("0")).to.be.true;
            expect(newUETH.eq("0")).to.be.true;
        });

        it("Should validate that total supply matches minted tokens", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let expectedSupply = BigNumber.from(0);
            let supply = BigNumber.from(0);

            // Zero supply
            supply = (await wallets[0].contract.totalSupply());
            expect(supply.eq(0)).to.be.true;

            // Deposit
            let uethValues = [ 1, 2, 99, 100 ];
            for (let i = 0; i < uethValues.length; i++) {
                let ueth = uethValues[i];
                let tx = (await wallets[0].contract.deposit({value: KSink.uethToWei(ueth)}));
                let txResult = (await KSink.waitWriteMethod(tx));
                expectedSupply = expectedSupply.add(KSink.uethToUETHToken(ueth));

                supply = (await wallets[0].contract.totalSupply());
                expect(supply.eq(expectedSupply)).to.be.true;
            }

            // Withdraw
            while (expectedSupply.gt(0))
            {
                let ueth = expectedSupply.div(2);
                if (expectedSupply.div(2).lt(1000000 * 2)) {
                    ueth = expectedSupply;
                }

                await KSink.waitWriteMethod(wallets[0].contract.withdraw(ueth));
                expectedSupply = expectedSupply.sub(ueth);

                supply = (await wallets[0].contract.totalSupply());
                expect(supply.eq(expectedSupply)).to.be.true;
            }

            // Zero supply
            supply = (await wallets[0].contract.totalSupply());
            expect(supply.eq(0)).to.be.true;
        });

    });

    //
    // Deposit revert cases
    //

    describe("Deposit revert cases", function() {

        it("Should revert when deposit is less than 1 uETH", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

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
                let txPromise = wallets[0].contract.deposit({value: eth});

                await expect(
                    KSink.waitWriteMethod(txPromise)
                ).to.be.revertedWith("Minimum deposit is 1 uETH.");
            }

        });

    });

    //
    // Withdrawal revert cases
    //

    describe("Withdrawal revert cases", function() {

        it("Should revert on insufficient balance", async function() {
            //if (chainId != ChainID.Hardhat) {
            //    this.skip();
            //}

            // Deposit
            let ether = "0.0001"; // 100 uETH
            let ueth = KSink.etherToUETH(ether);

            let tx = (await wallets[0].contract.deposit({value: KSink.uethToWei(ueth)}));
            let txResult = (await KSink.waitWriteMethod(tx));

            // Overdraw
            let txPromise = wallets[0].contract.withdraw(KSink.uethToUETHToken(ueth.add(1)));
            await expect(
                KSink.waitWriteMethod(txPromise)
            ).to.be.revertedWith("Insufficient balance.");

            // Withdraw remaining
            await KSink.waitWriteMethod(wallets[0].contract.withdraw(uethToUETHToken(ueth)));
        });

    });

    //
    // Transfers
    //

    describe("Transfers", function() {

        it("Should transfer uETH tokens wallets and emit a Transfer event", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let eth = ethers.utils.parseEther("0.05");
            let ueth = KSink.uethToUETHToken("50000");
            let uethHalf = ueth.div(2);

            let balance1 = BigNumber.from("0");
            let balance2 = BigNumber.from("0");

            // Check initial balances
            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq("0")).to.be.true;

            balance2 = (await wallets[2].contract.balanceOf(wallets[2].address));
            expect(balance2.eq("0")).to.be.true;

            // Deposit to wallet 1
            let tx = (await wallets[1].contract.deposit({value: eth}));
            let txResult = (await KSink.waitWriteMethod(tx));

            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq(ueth)).to.be.true;

            // Transfer half to wallet 2
            tx = (await wallets[1].contract.transfer(wallets[2].address, uethHalf));
            txResult = (await KSink.waitWriteMethod(tx));
            expect(writeResultContainsEvent(txResult, "Transfer")).to.be.true;

            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq(uethHalf)).to.be.true;

            balance2 = (await wallets[2].contract.balanceOf(wallets[2].address));
            expect(balance2.eq(uethHalf)).to.be.true;

            // Withdraw remaining
            await KSink.waitWriteMethod(wallets[1].contract.withdraw(uethHalf));
            await KSink.waitWriteMethod(wallets[2].contract.withdraw(uethHalf));
        });

        it("Should error when transferring tokens to the zero address", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let eth = ethers.utils.parseEther("0.05");
            let ueth = KSink.uethToUETHToken("50000");
            let uethHalf = ueth.div(2);

            let balance1 = BigNumber.from("0");

            // Check initial balance
            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq("0")).to.be.true;

            // Deposit to wallet 1
            let tx = (await wallets[1].contract.deposit({value: eth}));
            let txResult = (await KSink.waitWriteMethod(tx));

            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq(ueth)).to.be.true;

            // Transfer to zero address
            await expect(
                (wallets[1].contract.transfer("0x0000000000000000000000000000000000000000", uethHalf))
            ).to.be.revertedWith("ERC20: transfer to the zero address");

            // Withdraw remaining
            await KSink.waitWriteMethod(wallets[1].contract.withdraw(balance1));
        });

        it("Should allow a spending allowance on another account", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let eth = ethers.utils.parseEther("0.1");
            let ueth = KSink.uethToUETHToken("100000");
            let transferUETH = KSink.uethToUETHToken("1");

            let balance1 = BigNumber.from("0");
            let balance2 = BigNumber.from("0");

            let allowance = BigNumber.from("0");

            // Check initial balances
            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq("0")).to.be.true;

            balance2 = (await wallets[2].contract.balanceOf(wallets[2].address));
            expect(balance2.eq("0")).to.be.true;

            // Deposit to wallet 1
            let tx = (await wallets[1].contract.deposit({value: eth}));
            let txResult = (await KSink.waitWriteMethod(tx));

            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq(ueth)).to.be.true;

            // Try to spend from a disallowed peer account
            await expect(
                wallets[2].contract.transferFrom(wallets[1].address, wallets[2].address, transferUETH)
            ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

            // Ask peer to check allowance
            allowance = (await wallets[2].contract.allowance(wallets[1].address, wallets[2].address));
            expect(allowance.eq("0")).to.be.true;

            // Allow peer to spend up to 1 full token
            await wallets[1].contract.approve(wallets[2].address, transferUETH);

            // Ask peer to check allowance
            allowance = (await wallets[2].contract.allowance(wallets[1].address, wallets[2].address));
            expect(allowance.eq(transferUETH)).to.be.true;

            // Ask peer to transfer tokens
            wallets[2].contract.transferFrom(wallets[1].address, wallets[2].address, transferUETH)

            allowance = (await wallets[2].contract.allowance(wallets[1].address, wallets[2].address));
            expect(allowance.eq("0")).to.be.true;

            // Check token balances
            balance1 = (await wallets[1].contract.balanceOf(wallets[1].address));
            expect(balance1.eq(ueth.sub(transferUETH))).to.be.true;

            balance2 = (await wallets[2].contract.balanceOf(wallets[2].address));
            expect(balance2.eq(transferUETH)).to.be.true;

            // Withdraw remaining
            await KSink.waitWriteMethod(wallets[1].contract.withdraw(balance1));
            await KSink.waitWriteMethod(wallets[2].contract.withdraw(balance2));
        });

    });

    //
    // Stress tests
    //

    describe("Stress testing", function() {

        it("Verify that contract balances are correct after 1000 mixed transactions", async function() {
            if (chainId != ChainID.Hardhat) {
                this.skip();
            }

            let transCount = 1000;

            let walletTotal = [];
            for (let i = 0; i < wallets.length; i++) {
                let balance = (await wallets[i].contract.balanceOf(wallets[i].address));
                walletTotal.push(balance);
            }

            let amounts = [
                "0.000001", // 1 uETH
                "0.000002", // 2 uETH
                "0.000010", // 10 uETH
                "0.000032", // 32 uETH
                "0.000099", // 99 uETH
                "0.0001",   // 100 uETH
                "0.000101", // 101 uETH
            ];
            let amountIndex = 0;
            let walletIndex = 0;

            for (let i = 0; i < transCount; i++) {

                let wallet = wallets[walletIndex];

                // Purchase uETH
                let ether = amounts[amountIndex];
                let eth = ethers.utils.parseEther(ether);
                let ueth = KSink.uethToUETHToken(KSink.etherToUETH(ether));

                let startETH = (await wallet.wallet.getBalance());
                let startUETH = (await wallet.contract.balanceOf(wallet.address));

                let tx = (await wallet.contract.deposit({value: eth}));
                let txResult = (await KSink.waitWriteMethod(tx));

                let newETH = (await wallet.wallet.getBalance());
                let newUETH = (await wallet.contract.balanceOf(wallet.address));

                let temp: any = null;
                
                //console.log("i: " + i + ", startETH: " + startETH + ", newETH: " + newETH + ", startUETH: " + startUETH + ", newUETH: " + newUETH);
                
                // Check wallet balance
                temp = BigNumber.from(startETH);
                temp = temp.sub(txResult.gasTotal);
                temp = temp.sub(eth);

                expect(temp.eq(newETH)).to.be.true;

                // Check uETH balance
                temp = BigNumber.from(newUETH);
                temp = temp.sub(startUETH);

                expect(temp.eq(ueth)).to.be.true;

                // Switch amounts/wallets
                amountIndex++;
                if (amountIndex >= amounts.length) {
                    amountIndex = 0;
                }

                walletIndex++;
                if (walletIndex >= wallets.length) {
                    walletIndex = 0;
                }
            }

            // Withdraw remaining
            for (let i = 0; i < wallets.length; i++) {
                let balance = (await wallets[i].contract.balanceOf(wallets[i].address));
                await KSink.waitWriteMethod(wallets[i].contract.withdraw(balance));
            }
        });

    });

    // ...
});
