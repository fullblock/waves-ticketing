interface script {
    //compiled script in base64 string 
    script: string
}
interface Company {
    dAppScript: script;
    //company address
    seed:string;
    //company address
    address: string;
}
//@notice sets a script to a company account 
//@dev need to be set once for every company
//@param companyAddress, the address to set the dApp script to
//@param dAppScript, the predefined script that is set to the dApp account
function createCompany(newCompany: Company, ): string {
    let setScriptTransactionId: string;
    return setScriptTransactionId;
}

interface ticket {
    //ticket name
    name: string;
    //description of the ticket
    description: string;
    // the amount of tokens
    amount: number;
    //is it possible to create more tokens?
    reissuable: boolean;
    //token script to prevent sending to without correct price
    script: script;
}
interface Event {
    // the address where event will created with
    address: string;
    //price of the ticket
    price: number;
    //who else besides the event account is able to send the ticket. This need to be the company account
    approvedSender: Company["address"];
    //the price that is maximum allowed to resell the ticket for
    maxResellPrice: number;
    //blockheigt from when its possible to send the ticket
    start: number;
    //blockheight to it is possible to send the ticket
    end: number;
    //ticket of the event
    ticket: ticket;
}

//@notice set data to the event account, create event ticket token and send to company account
//@dev first the data is set to event account
// after data is set, the token can be issued
// after token is issued, it can be send to company account
//@param_setupEvent address, the account that is used to sign the transactions with
//@param_setupEvent price
//@param_setupEvent approvedSender
//@param_setupEvent maxResellPrice
//@param_setupEvent start
//@param_setupEvent end
//@param_createTicket name
//@param_createTicket description
//@param_createTicket amount
//@param_createTicket reissuable
//@param_createTicket script
//@send_Ticket 
function createEvent(event: Event, company: Company): string[] {

    function setupEvent(address: string, price: number, approvedSender: string, maxResellPrice: number, start: number, end: number): string {
        let dataTransactionId: string;
        return dataTransactionId;
    }

    function createTicket(address: string, ticket: ticket): any {
        let tokenId: string;
        let issueTransactionId: string;
        let info = { "tokenId": tokenId, "issueTransactionId": issueTransactionId }
        return info;
    }

    function sendTicket(tokenId: string, companyAddress: Company["address"]): string {
        let transferTransactionId: string;
        return transferTransactionId;
    }

    let transactionIds: string[];
    return transactionIds;
}


//@notice buy a ticket from the company account. The ticket is send to buyer address
//@dev to buy a ticket you need to have enough waves on your account
//@param dAppAddress, the address of the company address you want the buy the ticket from
//@param address, the account you are going to buy the ticket with
//@param tokenId, the id of the token/ticket you want to buy.
//@param amount, the amount of tickets you want to buy
function buyTicket(dAppAddress: Company["address"], address: string, tokenId: string, amount: number): string {
    let invokeTransactionId;
    return invokeTransactionId
}

enum action {
    buy = "buy",
    sell = "sell"
}
interface order {
    // the addresses from buyer or seller
    address: string;
    // is the order to sell or to buy a ticket
    action: action;
    //the amount that need to be paid for the ticket
    price: number;
    //matchmaker
    matchmaker:Company;
}

//@notice let user sell their ticket to other users
//@dev the server needs to keep the orders locally stored until deadline expires or order is fulfilled. 
//@dev the order should be showed so users can opt in the buy it. 
//@param sellOrder, the order you would like to see fulfilled. One ticket at a time can be sold. 
function putTicketUpForSale(sellOrder:order) {
}

//@notice let users buy  sell orders 
//@dev user can only by 1 ticket at a time for now.
//param buyOrder, an order that says the user want to by the ticket
//param sellOrder, the order that the user want to buy
function buyFromOrder(buyOrder:order, sellOrder:order):string{
    let exchangeTransactionId;
    return exchangeTransactionId;
}




//TODO update ticket function

