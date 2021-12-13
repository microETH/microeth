import {ethers} from "hardhat";
import {BigNumber, BigNumberish, Signer} from 'ethers';

export const waitWriteMethod = async function(tx: Promise<any>): Promise<{ events: any }> {
    let txResponse = (await (await tx).wait());
    return { events: txResponse.events };
}

// Returns whether or not a wallet balance changes by (value) after a transaction has been mined.
export const waitWalletBalanceChange = async function(tx: Promise<any>, wallet: Signer, startBalance: BigNumberish, value: BigNumberish): Promise<boolean> {
    let txMined = (await (await tx).wait());
    let newBalance = (await wallet.getBalance());

    let cumulativeGasUsed = BigNumber.from(txMined.cumulativeGasUsed);
    let effectiveGasPrice = BigNumber.from(txMined.effectiveGasPrice);
    let gasUsed = cumulativeGasUsed.mul(effectiveGasPrice);

    let temp = BigNumber.from(startBalance);
    temp = temp.sub(gasUsed);
    temp = temp.sub(BigNumber.from(value));

    return temp.eq(newBalance);
}
