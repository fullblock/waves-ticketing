import React from "react";
import {Button, Header, Icon, Input, Label, Modal, Grid} from "semantic-ui-react";

export default class ContractDataRetriever extends React.Component {
    constructor(props) {
        super(props);
        this.handleChangeAddress = this.handleChangeAddress.bind(this);
        this.initiateDataFetch = this.initiateDataFetch.bind(this);
        this.setContractState = this.setContractState.bind(this);
        this.finalizeAdding = this.finalizeAdding.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.renderErrorLabel = this.renderErrorLabel.bind(this);
        this.renderContractInfo = this.renderContractInfo.bind(this);
        this.setErrorState = this.setErrorState.bind(this);

        this.chainConnector = this.props.chainConnector;

        this.chainConnector.onUpdate(state => {
            this.setState({
                keeperState: state
            })
        });

        this.state = {
            contract: {
                buyerPubkey: "",
                sellerPubkey: "",
                blockUnlocked: 0,
                verificationHash: "",
                buyerAddress: "",
                senderAddress: "",
                sum: 0
            },
            keeperState: this.chainConnector.getKeeperState(),
            error: false
        }
    }

    handleChangeAddress(event) {
        console.log("handlechangeaddress")
  /*     
        this.setState({
            contractAddress: event.target.value
        });*/
    }

    initiateDataFetch() {
        console.log("initiateDataFetch")
        this.chainConnector.buyTicket();
        /*
        this.chainConnector.fetchContractData(this.state.contractAddress)
            .then((data) => {this.setContractState(data)})
            .catch(this.setErrorState);
        */
    }

    setErrorState() {
        this.setState({
            error: true
        });
    }

    setContractState(contractData) {
        this.setState({
            contract: contractData
        }, this.openModal)
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    finalizeAdding() {
        this.props.parentCallback(this.state.contract);
        this.closeModal();
        this.setState({
            contract: {
                buyerPubkey: "",
                sellerPubkey: "",
                blockUnlocked: 0,
                verificationHash: "",
                buyerAddress: "",
                senderAddress: "",
                sum: 0
            }
        })
    }

    renderErrorLabel() {
        if (this.state.error) {
            return (
                <Label basic color="red" pointing style={{marginTop: "3px"}}><Icon name="times" color="red"/>This does not seem to be an address with an escrow contract.</Label>
            )
        }
        else {}
    }

    renderContractInfo() {
        if (!this.state.keeperState || this.state.contract.sellerAddress != this.state.keeperState.account.address) {
            return (<p color="red">
                <Icon name="warning sign" color="red"/>
                <b>The recipient in this contract does not match your current address. Are you sure you want to add the contract regardless?</b>
            </p>)
        } else if (this.state.contract.sum == 0) {
            return (<p color="red">
                <Icon name="warning sign" color="red"/>
                <b>This escrow contract seems to have been drained. Are you sure you want to add the contract regardless?</b>
            </p>)
        } else {
            return (<p>
                <b>Do you want to add this contract to your list?</b>
            </p>)
        }
    }

    render() {
        return(
            [
                <div className="item-box">
                    <div className="ui lefc icon input">
                    <Input  onChange={this.handleChangeAddress} value={this.state.contractAddress} icon='share square' iconPosition='left' placeholder="Address of the contract" style={{width: "400px"}}/>
                </div>

                    <Button
                        primary
                        onClick={this.initiateDataFetch}>
                        <Icon name='shop'/>Buy
                    </Button>
                    <Modal
                        open={this.state.open}>
                        <Modal.Header>Add contract</Modal.Header>
                        <Modal.Content>
                            <Modal.Description>
                                <Header>Contract parameters</Header>
                                <p><b>Buyer address: </b>{this.state.contract.buyerAddress}</p>
                                <p><b>Seller address: </b>{this.state.contract.sellerAddress}</p>
                                <p><b>Block unlocked: </b>{this.state.contract.blockUnlocked}</p>
                                <p><b>Sum: </b>{this.state.contract.sum}</p>
                                <p><b>Verification hash: </b>{this.state.contract.verificationHash}</p>
                                <p> </p>
                            </Modal.Description>
                            <Modal.Actions align="right">
                                <Button negative onClick={this.closeModal}>Cancel</Button>
                                <Button positive onClick={this.finalizeAdding}>Add</Button>
                            </Modal.Actions>
                        </Modal.Content>
                    </Modal>
                </div>,
                <div>
                    {this.renderErrorLabel()}
                </div>
                ]
        )
    }
}
