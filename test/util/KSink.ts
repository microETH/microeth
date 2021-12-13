import {ethers} from "hardhat";
import {BigNumber, BigNumberish, Signer} from 'ethers';

interface WriteResult {
    events: any,
    gasTotal: BigNumber
}

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

export const parseMETH = (meth: string): BigNumber => {
    return ethers.utils.parseUnits(meth, 12);
}
