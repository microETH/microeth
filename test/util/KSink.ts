
export const waitWriteMethod = async function(tx: Promise<any>): Promise<{ events: any }> {
    let txResponse = (await (await tx).wait());
    return { events: txResponse.events };
}
