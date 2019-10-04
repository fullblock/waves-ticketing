import React from "react";
import {Button, Grid, Icon, Modal, Popup, Table} from "semantic-ui-react";

export default class DeployedEscrow extends React.Component {
    constructor(props) {
        super(props);

        this.openDeletionConfirmation = this.openDeletionConfirmation.bind(this);
        this.closeDeletionConfirmation = this.closeDeletionConfirmation.bind(this);

        this.state = {
            deleteConfirmationOpen: false
        };
    }

    openDeletionConfirmation() {
        this.setState({deleteConfirmationOpen: true})
    }

    closeDeletionConfirmation() {
        this.setState({deleteConfirmationOpen: false})
    }

    copyToClipboard (string) {
        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = string;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }

    render() {
        return(
            [
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
                </Modal>,
                <Table.Row>
                    <Table.Cell> <a href={this.props.explorerURL} target="_blank">{this.props.address}</a> </Table.Cell>
                    <Table.Cell> {this.props.counterparty} </Table.Cell>
                    <Table.Cell> {this.props.sum} </Table.Cell>
                    <Table.Cell> {this.props.expiry} </Table.Cell>
                    <Table.Cell> {this.props.status} </Table.Cell>
                    <Table.Cell style={{width: '175px'}}>
                        <Grid>
                            <Grid.Row>
                                <Grid.Column style={{width: '75px'}}>
                                    <Popup
                                        trigger={<Button
                                            style={{width: '70px'}}
                                            onClick={() => {this.copyToClipboard(this.props.verificationString)}}
                                            color="blue"
                                        ><Icon name="key"/></Button>}
                                        content={<p>Verification string was copied to clipboard.</p>}
                                        on='click'
                                        position='top right'
                                        pinned
                                    />
                                </Grid.Column>
                                <Grid.Column style={{width: '75px'}}>
                                    <Button
                                        style={{width: '70px'}}
                                        onClick={this.openDeletionConfirmation}
                                        color="red"
                                    ><Icon name="trash alternate"/></Button>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Table.Cell>
                </Table.Row>
            ]

        );
    }
}