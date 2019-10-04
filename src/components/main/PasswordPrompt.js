import React from "react";
import {base58Encode, keccak, stringToBytes} from "@waves/ts-lib-crypto";
import {Button, Header, Icon, Input, Label, Modal, Grid} from "semantic-ui-react";
import storageUtils from "../../utils/storageUtils"

class PasswordPromptNew extends React.Component {
    constructor(props) {
        super(props);

        this.checkPassword = this.checkPassword.bind(this);
        this.confirmPassword = this.confirmPassword.bind(this);
        this.renderPasswordInputs = this.renderPasswordInputs.bind(this);
        this.parentSwitch = this.parentSwitch.bind(this);

        this.pass = React.createRef();
        this.passVerify = React.createRef();

        this.state = {
            componentState: "initial"
        }
    }

    checkPassword() {
        let password = this.pass.current.inputRef.current.value;
        let storageKey = base58Encode(keccak(base58Encode(keccak(stringToBytes(password)))));

        return storageUtils.checkKey(storageKey)
    }

    confirmPassword() {

        let password = this.pass.current.inputRef.current.value;
        let passwordConfirm = this.passVerify.current.inputRef.current.value;

        if (this.checkPassword()) {
            this.setState({
                componentState: "failedAlreadyExists"
            })
        } else if (password != passwordConfirm) {
            this.setState({
                componentState: "failedDoesNotMatch"
            })
        }
        else {
            this.props.parentCallback(password);
        }
    }

    renderPasswordInputs() {
        switch (this.state.componentState) {
            case "initial":
                return (
                    <Grid divided='vertically'>
                        <Grid.Column>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input type="password" placeholder="Enter secret..." ref={this.pass}/>
                            </Grid.Row>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input type="password" placeholder="Confirm secret..." ref={this.passVerify}/>
                            </Grid.Row>
                        </Grid.Column>
                    </Grid>
                );
            case "failedAlreadyExists":
                return (
                    <Grid divided='vertically'>
                        <Grid.Column>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input color="red" type="password" placeholder="Enter secret..." ref={this.pass}/>
                                <Label basic color="red" pointing="left"><Icon name="times" color="red"/>Secret already exists.</Label>
                            </Grid.Row>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input color="red" type="password" placeholder="Confirm secret..." ref={this.passVerify}/>
                            </Grid.Row>
                        </Grid.Column>
                    </Grid>
                );
            case "failedDoesNotMatch":
                return (
                    <Grid divided='vertically'>
                        <Grid.Column>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input color="red" type="password" placeholder="Enter secret..." ref={this.pass}/>
                            </Grid.Row>
                            <Grid.Row style={{paddingBottom: '10px'}}>
                                <Input color="red" type="password" placeholder="Confirm secret..." ref={this.passVerify}/>
                                <Label basic color="red" pointing="left"><Icon name="times" color="red"/>Fields do not match.</Label>
                            </Grid.Row>
                        </Grid.Column>
                    </Grid>
                );
        }
    }

    parentSwitch() {
        this.props.parentSwitch();
    }

    render() {
        return(
            <Modal basic size='small' open={true}>
                <Header icon='user secret' content='Secret' />
                <Modal.Content>
                    <p>Create a new secret.</p>
                    <p><Icon name="warning"/>This secret will be used for local encryption and is only stored locally.
                        Memorize it to access your data in the future!</p>
                    {this.renderPasswordInputs()}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='green' inverted onClick={this.confirmPassword}>
                        <Icon name='checkmark' /> Confirm
                    </Button>
                    <Button inverted onClick={this.parentSwitch}>
                        Enter existing secret
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

class PasswordPromptReturn extends React.Component {
    constructor(props) {
        super(props);

        this.checkPassword = this.checkPassword.bind(this);
        this.confirmPassword = this.confirmPassword.bind(this);
        this.renderPasswordInputs = this.renderPasswordInputs.bind(this);
        this.parentSwitch = this.parentSwitch.bind(this);

        this.pass = React.createRef();
        this.state = {
            componentState: "initial"
        }
    }

    checkPassword() {
        let password = this.pass.current.inputRef.current.value;
        let storageKey = base58Encode(keccak(base58Encode(keccak(stringToBytes(password)))));

        return storageUtils.checkKey(storageKey)
    }

    confirmPassword() {

        let password = this.pass.current.inputRef.current.value;



        if (!this.checkPassword()) {
            this.setState({
                componentState: "failedDoesNotExist"
            })
        } else {
            this.props.parentCallback(password);
        }
    }

    renderPasswordInputs() {
        switch (this.state.componentState) {
            case "initial":
                return (
                        <Input type="password" placeholder="Enter secret..." ref={this.pass}/>
                );
            case "failedDoesNotExist":
                return (
                        <div>
                            <Input color="red" type="password" placeholder="Enter secret..." ref={this.pass}/>
                            <Label basic color="red" pointing="left"><Icon name="times" color="red"/>Secret does not exist.</Label>
                        </div>
                );
        }
    }

    parentSwitch() {
        this.props.parentSwitch();
    }

    render() {
        return(
            <Modal basic size='small' open={true}>
                <Header icon='user secret' content='Secret' />
                <Modal.Content>
                    <p>Enter your secret.</p>
                    {this.renderPasswordInputs()}
                </Modal.Content>
                <Modal.Actions>
                    <Button color='green' inverted onClick={this.confirmPassword}>
                        <Icon name='checkmark' /> Confirm
                    </Button>
                    <Button inverted onClick={this.parentSwitch}>
                        <Icon name='plus' /> New secret
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default class PasswordPrompt extends React.Component {
    constructor(props) {
        super(props);

        this.switchModal = this.switchModal.bind(this);
        this.savePasswordForSession = this.savePasswordForSession.bind(this);

        this.state = {
            newPassword: false
        }
    }

    switchModal() {
        this.setState({
            newPassword: !this.state.newPassword
        })
    }

    savePasswordForSession(password) {

        let encryptionKey = base58Encode(keccak(stringToBytes(password)));
        let storageKey = base58Encode(keccak(encryptionKey));


        window.sessionStorage.setItem("passwordHash", encryptionKey);

        let data = storageUtils.readAndDecrypt(storageKey, encryptionKey);
        if (!data) {
            storageUtils.encryptAndWrite(storageKey, JSON.stringify({}), encryptionKey);
        }
        this.props.parentCallback();
    }

    render() {
        if (this.state.newPassword) {
            return (
                <PasswordPromptNew parentCallback={this.savePasswordForSession} parentSwitch={this.switchModal}/>
            )
        } else {
            return (
                <PasswordPromptReturn parentCallback={this.savePasswordForSession} parentSwitch={this.switchModal}/>
            )
        }
    }
}