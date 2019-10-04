describe('ticket test suite', () => {

    const eventName = "fullblock event"
    const description = "an event token for fullblock"
    const quantity = 1000;
    let createTokenTx = null;


    before(async function () {
        //create accounts and send waves to the account from the account configured in the surfboard.config.json
        await setupAccounts(
            {
                companyAccount: 20000000,
                eventAccount: 200000000,
                fan: 100000000
            });

        //set transactions
        const assetScript = compile(file('ticket.ride'));
        const dataApprovedSenderTx = data({ data: [{ key: "approvedSender", value: address(accounts.companyAccount) }] }, accounts.eventAccount);
        createTokenTx = issue({ name: eventName, description: description, quantity: quantity, reissuable: true, decimals: 0, script: assetScript }, accounts.eventAccount);
        const transferTokensTx = transfer({ amount: 200, recipient: address(accounts.companyAccount), fee: 500000, assetId: createTokenTx.id }, accounts.eventAccount);
        //set 'data isAllowSender' in eventAccount
        await broadcast(dataApprovedSenderTx);
        await waitForTx(dataApprovedSenderTx.id);
        console.log('Data for approvedSender is set - ' + dataApprovedSenderTx.id);
        // create token
        await broadcast(createTokenTx);
        await waitForTx(createTokenTx.id);
        console.log("Token is created - " + createTokenTx.id)
        //send tokens from eventAccount to company account
        await broadcast(transferTokensTx);
        await waitForTx(transferTokensTx.id)
        console.log('token is send to company account - ' + transferTokensTx.id);
    });

    it('the company can sent the token', async function () {
        const transferTokensTx = transfer({ amount: 1, recipient: address(accounts.fan), fee: 500000, assetId: createTokenTx.id }, accounts.companyAccount);
        const announce = await broadcast(transferTokensTx);
        expect(announce.trace[0].result).to.equal('ok');
        expect(announce.trace[0].assetId).to.equal(createTokenTx.id);

    })
    it('the fan cannot sent the token with transferTransaction', async function () {
        const transferTokensTx = transfer({ amount: 1, recipient: address(accounts.companyAccount), fee: 500000, assetId: createTokenTx.id }, accounts.fan);
        //const announce = await broadcast(transferTokensTx);

        await expect(broadcast(transferTokensTx)).to.be.rejectedWith("Transaction is not allowed by token-script");
    })
})