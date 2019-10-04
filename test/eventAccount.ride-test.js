describe('event account test suite', () => {

    const price = 123456;
    const eventName = "fullblock event"
    const description = "an event token for fullblock"
    const quantity = 1000;
    const amountOfTickets = 2
    let createTokenTx = null;
    let startHeight = 0;
    let stopHeight = 0;

    before(async function () {
        //create accounts and send waves to the account from the account configured in the surfboard.config.json
        await setupAccounts(
            {
                companyAccount: 20000000,
                eventAccount: 200000000,
                fan: 100000000
            });

        //set transactions
        const script = compile(file('eventAccount.ride'));
        const setScriptTx = setScript({ script }, accounts.companyAccount);
        createTokenTx = issue({ name: eventName, description: description, quantity: quantity, reissuable: true, decimals: 0 }, accounts.eventAccount);
        const dataPriceTx = data({ data: [{ key: "price", value: price }, { key: "start", value: startHeight }, { key: "end", value: stopHeight }] }, accounts.eventAccount);
        const dataStartHeightTx = data({ data: [{ key: "start", value: startHeight }, { key: "end", value: startHeight }] }, accounts.eventAccount);

        const transferTokensTx = transfer({ amount: 1000, recipient: address(accounts.companyAccount), assetId: createTokenTx.id }, accounts.eventAccount);


        //set price in eventAccount
        await broadcast(dataPriceTx);
        await waitForTx(dataPriceTx.id);
        console.log('Data for price is set - ' + dataPriceTx.id);
        // create token
        await broadcast(createTokenTx);
        await waitForTx(createTokenTx.id);
        console.log("Token is created - " + createTokenTx.id)
        //set script to company account
        await broadcast(setScriptTx);
        await waitForTx(setScriptTx.id)
        console.log('Script has been set - ' + setScriptTx.id);
        //send tokens from eventAccount to company account
        await broadcast(transferTokensTx);
        await waitForTx(transferTokensTx.id)
        console.log('token is send to company account - ' + transferTokensTx.id);
    });

    it('you can buy a ticket', async function () {
        const invokeScriptTx = invokeScript({
            dApp: address(accounts.companyAccount),
            call: {
                function: "buyTicket",
                args: [{ type: 'string', value: createTokenTx.id }, { type: 'integer', value: amountOfTickets }]
            },
            payment: [{ assetId: null, amount: (price * amountOfTickets) }]
        }, accounts.fan);

        const announce = await broadcast(invokeScriptTx);
        expect(announce.trace[0].result.transfers[0].assetId).to.equal(createTokenTx.id);
        expect(announce.trace[0].result.transfers[0].amount).to.equal(amountOfTickets);
    })

    it('you cannot buy ticket with lower price', async function () {
        const invokeScriptTx = invokeScript({
            dApp: address(accounts.companyAccount),
            call: {
                function: "buyTicket",
                args: [{ type: 'string', value: createTokenTx.id }, { type: 'integer', value: amountOfTickets }]
            },
            payment: [{ assetId: null, amount: 12345 }]
        }, accounts.fan);

        await expect(broadcast(invokeScriptTx)).to.be.rejectedWith("Not the correct price. The price for " + amountOfTickets + " tickets = " + amountOfTickets * price + ". You are paying: 12345");
    })

    it('you cannot buy ticket with higher price', async function () {
        const invokeScriptTx = invokeScript({
            dApp: address(accounts.companyAccount),
            call: {
                function: "buyTicket",
                args: [{ type: 'string', value: createTokenTx.id }, { type: 'integer', value: 2 }]
            },
            payment: [{ assetId: null, amount: 1234567 }]
        }, accounts.fan);

        await expect(broadcast(invokeScriptTx)).to.be.rejectedWith("Not the correct price. The price for " + amountOfTickets + " tickets = " + amountOfTickets * price + ". You are paying: 1234567");
    })
})