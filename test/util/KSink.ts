import {ethers} from "hardhat";
import {BigNumber, BigNumberish, Signer, Contract} from 'ethers';

//
// Interfaces
//

export interface TestWallet {
    wallet: Signer,
    address: string,
    contract: Contract
}

export interface WriteResult {
    events: any[],
    gasTotal: BigNumber
}

//
// Methods
//

export const waitWriteMethod = async function(tx: Promise<any>): Promise<WriteResult> {
    let txMined = (await (await tx).wait());

    let cumulativeGasUsed = BigNumber.from(txMined.cumulativeGasUsed);
    let effectiveGasPrice = BigNumber.from(txMined.effectiveGasPrice);
    let gasTotal = cumulativeGasUsed.mul(effectiveGasPrice);

    return {
        events: txMined.events,
        gasTotal: gasTotal
    };
}

export const writeResultContainsEvent = function(result: WriteResult, eventName: string): boolean {
    for (let i = 0; i < result.events.length; i++) {
        let event = result.events[i];
        if (event.hasOwnProperty("event") && event["event"] == eventName) {
            return true;
        }
    }

    return false;
}

export const parseUETH = (ueth: string): BigNumber => {
    return ethers.utils.parseUnits(ueth, 12);
}

export const uethToWei = (ueth: BigNumberish): BigNumber => {
    return BigNumber.from(ueth).mul('1000000000000');
}

export const uethTokenToWei = (ueth: BigNumberish): BigNumber => {
    return BigNumber.from(ueth).div('1000000');
}

export const uethToUETHToken = (ueth: BigNumberish): BigNumber => {
    return BigNumber.from(ueth).mul('1000000000000000000');
}
