import React from "react";
import {keccak as oldKeccak} from "waves-crypto";
import {Button, Grid, Header, Icon, Input, Modal, Label} from "semantic-ui-react";

export default class Deployer extends React.Component {
    constructor(props) {
        super(props);
        this.initDeployment = this.initDeployment.bind(this);
        this.setContractData = this.setContractData.bind(this);
        this.fundDeployment = this.fundDeployment.bind(this);
        this.setEscrowData = this.setEscrowData.bind(this);
        this.setEscrowScript = this.setEscrowScript.bind(this);
        this.finalizeDeployment = this.finalizeDeployment.bind(this);
        this.raiseDeploymentError = this.raiseDeploymentError.bind(this);
        this.fundContract = this.fundContract.bind(this);
        this.finalizeFunding = this.finalizeFunding.bind(this);
        this.raiseFundingError = this.raiseFundingError.bind(this);
        this.finishAndClose = this.finishAndClose.bind(this);
        this.renderDeploymentButton = this.renderDeploymentButton.bind(this);
        this.renderFundingButton = this.renderFundingButton.bind(this);
        this.renderAddressDisplay = this.renderAddressDisplay.bind(this);
        this.renderInputs = this.renderInputs.bind(this);
        this.handleChangePubkey = this.handleChangePubkey.bind(this);
        this.handleChangeSum = this.handleChangeSum.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.openExitConfirmation = this.openExitConfirmation.bind(this);
        this.closeExitConfirmation = this.closeExitConfirmation.bind(this);
        this.conditionalCloseModal = this.conditionalCloseModal.bind(this);

        this.chainConnector = this.props.chainConnector;

        this.state = {
            pubKey: "",
            sum: "",
            deploymentPhase: "initial",
            fundingPhase: "initial",
        }
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    conditionalCloseModal() {
        if (this.state.deploymentPhase != "initial" && this.state.deploymentPhase != "error") {
            this.openExitConfirmation()
        }
        else {
            this.finishAndClose()
        }
    }

    openExitConfirmation() {
        this.setState({exitConfirmationOpen: true})
    }

    closeExitConfirmation() {
        this.setState({exitConfirmationOpen: false})
    }

    setContractData(contractData, callback) {
        this.setState({
            contract: contractData
        },callback);
    }

    initDeployment() {
        this.chainConnector.genEscrow().then(contractData => {
            contractData.buyerPubkey = this.chainConnector.getKeeperState().account.publicKey;
            contractData.sellerPubkey = this.state.pubKey;
            contractData.verificationHash = oldKeccak(contractData.verificationString);
            contractData.sum = this.state.sum;
            this.setContractData(contractData, this.fundDeployment);
        });
    }

    fundDeployment() {
        this.setState({deploymentPhase: "fundingAddress"});
        this.chainConnector.fundDeployment(this.state.contract.address).then(this.setEscrowData).catch(this.raiseDeploymentError);
    }

    setEscrowData() {
        this.setState({deploymentPhase: "settingData"});
        this.chainConnector.setEscrowData(
            this.state.contract.seed,
            this.state.contract.buyerPubkey,
            this.state.contract.sellerPubkey,
            this.state.contract.pubkey,
            this.state.contract.verificationHash,
            this.state.contract.blockUnlocked,
        ).then(this.setEscrowScript).catch(this.raiseDeploymentError);
    }

    setEscrowScript() {
        this.setState({deploymentPhase: "settingScript"});
        this.chainConnector.setEscrowScript(
            this.state.contract.seed,
        ).then(this.finalizeDeployment).catch(this.raiseDeploymentError);
    }

    finalizeDeployment() {
        this.setState({deploymentPhase: "finalized"});
        this.setState({fundingPhase: "allowed"});
    }

    raiseDeploymentError() {
        this.setState({deploymentPhase: "error"})
    }

    fundContract() {
        this.setState({fundingPhase: "funding"});
        this.chainConnector.fundContract(
            this.state.contract.address,
            this.state.contract.sum,
        ).then(this.finalizeFunding).catch(this.raiseFundingError);
    }

    finalizeFunding() {
        this.setState({fundingPhase: "finalized"});
        this.props.parentCallback(
            {
                address: this.state.contract.address,
                counterparty: this.chainConnector.getAddress(this.state.contract.sellerPubkey),
                sum: this.state.contract.sum,
                expiry: this.state.contract.blockUnlocked,
                status: "Open",
                verificationString: this.state.contract.verificationString
            }
        );
        this.finishAndClose()
    }

    raiseFundingError() {
        this.setState({fundingPhase: "error"})
    }

    finishAndClose() {

        this.setState({
            pubKey: "",
            sum: "",
            deploymentPhase: "initial",
            fundingPhase: "initial",
            contract: undefined
        });

        this.closeModal();
        this.closeExitConfirmation();
    }

    handleChangePubkey(event) {
        this.setState({
            pubKey: event.target.value
        });
    }

    handleChangeSum(event) {
        this.setState({
            sum: event.target.value
        });
    }

    renderDeploymentButton() {
        switch (this.state.deploymentPhase) {
            case "initial": return (
                <Grid.Column>
                    <Button primary onClick={this.initDeployment}><Icon name='upload'/>Deploy</Button>
                </Grid.Column>
            );
            case "fundingAddress": return (
                <Grid.Column>
                    <Button primary loading>Deploy </Button> Funding address...
                </Grid.Column>
            );
            case "settingData": return (
                <Grid.Column>
                    <Button primary loading>Deploy </Button> Setting data for escrow contract...
                </Grid.Column>
            );
            case "settingScript": return (
                <Grid.Column>
                    <Button primary loading>Deploy </Button> Setting escrow script...
                </Grid.Column>
            );
            case "finalized": return (
                <Grid.Column>
                    <Button positive disabled><Icon name="check"/>Done</Button> <a href={this.chainConnector.getExplorerURL() + 'address/' + this.state.contract.address} target="_blank">See in Waves Explorer.</a>
                </Grid.Column>
            );
            case "error": return (
                <Grid.Column>
                    <Button primary onClick={this.initDeployment}>
                        <Icon name='redo'/>Retry
                    </Button> <Icon color='red' name='times'/> Something went wrong.
                </Grid.Column>
            )
        }
    }

    renderFundingButton() {
        switch (this.state.fundingPhase) {
            case "initial": return (
                <Grid.Column>
                    <Button primary disabled><Icon name='dollar sign'/>Fund</Button>
                </Grid.Column>
            );
            case "allowed": return (
                <Grid.Column>
                    <Button primary onClick={this.fundContract}><Icon name='dollar sign'/>Fund</Button>
                </Grid.Column>
            );
            case "funding": return (
                <Grid.Column>
                    <Button primary loading>Fund</Button> Funding contract...
                </Grid.Column>
            );
            case "finalized": return (
                <Grid.Column>
                    <Button positive disabled><Icon name="check"/>Done</Button>
                </Grid.Column>
            );

            case "error": return (
                <Grid.Column>
                    <Button primary onClick={this.fundContract}>
                        <Icon name='redo'/>Retry
                    </Button> <Icon color='red' name='times'/> Something went wrong.
                </Grid.Column>
            )

        }
    }

    renderAddressDisplay() {
        if (this.state.pubKey == "") {
            return;
        } else {
            return(<Label pointing>Address: {this.chainConnector.getAddress(this.state.pubKey)}</Label>)
        }
    }

    renderInputs() {
        if (this.state.deploymentPhase == "initial" || this.state.deploymentPhase == "error") {
            return(
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Input onChange={this.handleChangePubkey} value={this.state.pubKey} icon='share square' iconPosition='left' placeholder="Public key of the recepient" style={{width: "400px"}}/>
                            {this.renderAddressDisplay()}
                        </Grid.Column>
                        <Grid.Column>
                            <Input onChange={this.handleChangeSum} value={this.state.sum} icon='money bill alternate outline' iconPosition='left' placeholder="Sum" />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
        } else {
            return(
                <Grid>
                    <Grid.Row columns={2}>
                        <Grid.Column>
                            <Input disabled onChange={this.handleChangePubkey} value={this.state.pubKey} icon='share square' iconPosition='left' placeholder="Public key of the recepient" style={{width: "400px"}}/>
                            {this.renderAddressDisplay()}
                        </Grid.Column>
                        <Grid.Column>
                            <Input disabled onChange={this.handleChangeSum} value={this.state.sum} icon='money bill alternate outline' iconPosition='left' placeholder="Sum" />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
        }
    }

    render() {
        return(
            [
                <Modal size="mini" open={this.state.exitConfirmationOpen}>
                    <Modal.Header><Icon color="yellow" name="warning sign"/> Warning!</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            You seem to have already started deploying the contract. If you exit now, the contract will not be saved and the fees will be lost!
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.finishAndClose}>Exit</Button>
                        <Button basic onClick={this.closeExitConfirmation}>Cancel</Button>
                    </Modal.Actions>

                </Modal>,

                <Modal open={this.state.open} trigger={<Button primary onClick={this.openModal}><Icon name='plus'/>New</Button>} closeIcon onClose={this.conditionalCloseModal}>
                    <Modal.Header>Deploy the contract</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Header>Transaction parameters</Header>
                            {this.renderInputs()}
                            <Header>Deployment</Header>
                            <p><b>Contract deployment is done in two steps.</b></p>
                            <Grid>
                                <Grid.Row columns={2}>
                                    <Grid.Column>
                                        <p>First, you have to pay the fees for the address where the contract will be deployed.
                                            The address will be seeded with necessary data and the script will be deployed.</p>
                                        <p>Deployment may take several minutes.</p>
                                    </Grid.Column>
                                    <Grid.Column>
                                        <p>Second, you need to send the amount of your transaction to the address.</p>
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row columns={2}>
                                    {this.renderDeploymentButton()}
                                    {this.renderFundingButton()}
                                </Grid.Row>
                            </Grid>

                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            ]

        );

    }

}