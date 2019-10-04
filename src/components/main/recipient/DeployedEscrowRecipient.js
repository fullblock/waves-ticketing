import React from "react";
import {base64Encode} from "@waves/ts-lib-crypto";
import {keccak as oldKeccak} from "waves-crypto";
import {Button, Icon, Input, Label, Modal, Table, Grid, List} from "semantic-ui-react";

export default class DeployedEscrowRecipient extends React.Component {
    constructor(props) {
        super(props);

        this.setCurrentBlock = this.setCurrentBlock.bind(this);
        this.initializeModal = this.initializeModal.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.withdrawFunds = this.withdrawFunds.bind(this);
        this.withdrawFundsExpired = this.withdrawFundsExpired.bind(this);
        this.handleChangeVerificationKey = this.handleChangeVerificationKey.bind(this);
        this.finishWithdrawal = this.finishWithdrawal.bind(this);
        this.raiseWithdrawalError = this.raiseWithdrawalError.bind(this);
        this.finalize = this.finalize.bind(this);
        this.renderModalButton = this.renderModalButton.bind(this);
        this.renderFinalizeButton = this.renderFinalizeButton.bind(this);
        this.renderModalInput = this.renderModalInput.bind(this);
        this.renderModal = this.renderModal.bind(this);
        this.openDeletionConfirmation = this.openDeletionConfirmation.bind(this);
        this.closeDeletionConfirmation = this.closeDeletionConfirmation.bind(this);

        this.chainConnector = this.props.chainConnector;

        this.state = {
            blockNumber: 0,
            withdrawalButtonState: "restricted",
            withdrawalInputState: "initial",
            finalizeButtonState: "hidden"
        };
    }

    openDeletionConfirmation() {
        this.setState({deleteConfirmationOpen: true})
    }

    closeDeletionConfirmation() {
        this.setState({deleteConfirmationOpen: false})
    }

    setCurrentBlock(blockNumber, callback) {

        if (blockNumber >= this.props.blockUnlocked) {
            this.setState({
                withdrawalButtonState: "initial"
            })
        }

        this.setState({
            blockNumber: blockNumber
        }, callback);
    }

    initializeModal() {
        this.chainConnector.getCurrentBlock()
            .then(blockNumber => {
                this.setCurrentBlock(blockNumber, this.openModal)
            })
    }

    openModal() {
        this.setState({ open: true });
    }

    closeModal() {
        this.setState({ open: false });
    }

    withdrawFunds() {
        this.setState(
            {
                withdrawalInputState: "locked",
                withdrawalButtonState: "processing"
            }
        );

        this.chainConnector.withdrawFunds(
            this.chainConnector.getKeeperState().account.address,
            this.props.contractPubkey,
            this.state.verificationKey,
            this.props.sum,
        ).then(this.finishWithdrawal).catch(this.raiseWithdrawalError)
    }

    withdrawFundsExpired() {
        this.setState(
            {
                withdrawalInputState: "locked",
                withdrawalButtonState: "processing"
            }
        );
        this.chainConnector.withdrawFundsExpired(
            this.chainConnector.getKeeperState().account.address,
            this.props.contractPubkey,
            this.props.sum,
        ).then(this.finishWithdrawal).catch(this.raiseWithdrawalError)
    }

    raiseWithdrawalError() {
        this.setState(
            {
                withdrawalButtonState: "error",
            }
        );
    }

    finishWithdrawal() {
        this.setState(
            {
                withdrawalButtonState: "done",
                finalizeButtonState: "visible"
            }
        );
    }

    finalize() {
        this.closeModal();
        this.props.parentCallback(this.props.parentKey);
    }


    handleChangeVerificationKey(event) {
        this.setState({
            verificationKey: event.target.value
        });

        let hashedKey;

        try {
            hashedKey = base64Encode(oldKeccak(event.target.value))
        } catch {
            this.setState({
                withdrawalInputState: "failure",
                withdrawalButtonState: "restricted"
            })
        }

        if (hashedKey != this.props.verificationHash) {
            this.setState({
                withdrawalInputState: "failure",
                withdrawalButtonState: "restricted"
            })
        } else {
            this.setState({
                withdrawalInputState: "success",
                withdrawalButtonState: "initial"
            })
        }
    }

    renderFinalizeButton() {
        switch (this.state.finalizeButtonState) {
            case "hidden":
                return (
                    <div/>
                );
            case "visible":
                return (
                    <div><Button negative onClick={this.finalize}>Delete contract</Button></div>
                );
        }
    }

    renderModalInput() {
        switch (this.state.withdrawalInputState) {
            case "initial":
                return (
                    <Input
                        onChange={this.handleChangeVerificationKey}
                        value={this.state.verificationKey}
                        icon='key'
                        iconPosition='left'
                        placeholder="Verification key"
                    />
                );
            case "success":
                return (
                    <div>
                        <Input
                            onChange={this.handleChangeVerificationKey}
                            value={this.state.verificationKey}
                            icon='key'
                            iconPosition='left'
                            placeholder="Verification key"
                        />
                        <Label basic color="green" pointing="left"><Icon name="check" color="green"/>Verification string matches the hash.</Label>
                    </div>
                );
            case "failure":
                return (
                    <div>
                        <Input
                            onChange={this.handleChangeVerificationKey}
                            value={this.state.verificationKey}
                            icon='key'
                            iconPosition='left'
                            placeholder="Verification key"
                        />
                        <Label basic color="red" pointing="left"><Icon name="times" color="red"/>Verification string does not match the hash.</Label>
                    </div>
                );
            case "locked":
                return (
                    <Input
                        onChange={this.handleChangeVerificationKey}
                        value={this.state.verificationKey}
                        icon='key'
                        iconPosition='left'
                        placeholder="Verification key"
                        disabled
                    />
                )
        }
    }

    renderModalButton(action) {
        switch (this.state.withdrawalButtonState) {
            case "initial": return (
                <div><Button primary onClick={action}>Withdraw</Button></div>
            );
            case "processing": return (
                <div><Button primary loading>Fund</Button> Spending escrow transaction...</div>
            );
            case "done": return (
                <div><Button positive disabled><Icon name="check"/>Done</Button></div>
            );
            case "restricted": return (
                <div><Button primary disabled>Withdraw</Button></div>
            );
            case "error": return (
                <div><Button primary onClick={action}><Icon name='redo'/>Retry</Button><Icon color='red' name='times'/> Something went wrong.</div>
            )

        }
    }

    renderModal() {

        if (this.state.blockNumber >= this.props.blockUnlocked) {
            return (
                <Modal
                    open={this.state.open}
                >
                    <Modal.Header>Unlock funds</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <p>The time lock on the escrow contract has expired. You can withdraw the funds right away.</p>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <List horizontal>
                            <List.Item>
                                {this.renderModalButton(this.withdrawFundsExpired)}
                            </List.Item>
                            <List.Item>
                                {this.renderFinalizeButton()}
                            </List.Item>
                        </List>
                    </Modal.Actions>
                </Modal>
            )
        } else {
            return (
                <Modal
                    open={this.state.open}
                    closeIcon
                    onClose={this.closeModal}
                >
                    <Modal.Header>Unlock funds</Modal.Header>
                    <Modal.Content>
                        <Modal.Description>
                            <p>Enter the verification key to unlock funds.</p>
                            {this.renderModalInput()}
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <List horizontal>
                            <List.Item>
                                {this.renderModalButton(this.withdrawFunds)}
                            </List.Item>
                            <List.Item>
                                {this.renderFinalizeButton()}
                            </List.Item>
                        </List>
                    </Modal.Actions>
                </Modal>
            )
        }
    }


    render() {
        return(
            <Table.Row>
                <Table.Cell> <a href={this.props.explorerURL} target="_blank">{this.props.address}</a> </Table.Cell>
                <Table.Cell> {this.props.counterparty} </Table.Cell>
                <Table.Cell> {this.props.sum} </Table.Cell>
                <Table.Cell> {this.props.blockUnlocked} </Table.Cell>
                <Table.Cell> {this.props.status} </Table.Cell>
                <Table.Cell style={{width: '175px'}}>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column style={{width: '75px'}}>
                                <Button color="blue" style={{width: '70px'}} onClick={this.initializeModal}><Icon align="center" name="unlock"/></Button>
                                {this.renderModal()}
                            </Grid.Column>
                            <Grid.Column style={{width: '75px'}}>
                                <Button
                                    style={{width: '70px'}}
                                    onClick={this.openDeletionConfirmation}
                                    color="red"
                                ><Icon align="center" name="trash alternate"/></Button>

                                <Modal size="mini" open={this.state.deleteConfirmationOpen}>
                                    <Modal.Header><Icon color="yellow" name="warning sign"/> Warning!</Modal.Header>
                                    <Modal.Content>
                                        <Modal.Description>
                                            Are you sure you want to delete the contract? This action is irreversible.
                                        </Modal.Description>
                                    </Modal.Content>
                                    <Modal.Actions>
                                        <Button negative onClick={() => {this.props.parentCallback(this.props.parentKey)}}>Delete</Button>
                                        <Button basic onClick={this.closeDeletionConfirmation}>Cancel</Button>
                                    </Modal.Actions>
                                </Modal>

                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Table.Cell>
            </Table.Row>
        );
    }
}