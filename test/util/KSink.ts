import {ethers} from "hardhat";
import {BigNumber, BigNumberish, Signer} from 'ethers';

//
// Interfaces
//

export interface TestWallet {
    wallet: Signer,
    address: string,
    contract: any // Contract
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

export const parseMETH = (meth: string): BigNumber => {
    return ethers.utils.parseUnits(meth, 12);
}

export const methToWei = (meth: BigNumberish): BigNumber => {
    return BigNumber.from(meth).mul(1000000000000);
}
