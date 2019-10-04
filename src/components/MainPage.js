import React from "react";
import KeeperStatus from "./main/KeeperStatus"
import PasswordPrompt from "./main/PasswordPrompt"
import EscrowManager from "./main/sender/EscrowManager"
import EscrowManagerRecipient from "./main/recipient/EscrowManagerRecipient"
import {Container, Header, Menu} from "semantic-ui-react";
import BlockchainConnector from "../utils/blockchainUtils"

export default class MainPage extends React.Component {

    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.handleMenuClick = this.handleMenuClick.bind(this);
        this.renderUserType = this.renderUserType.bind(this);
        this.state = {
            activeItem: "sender"
        };

    }

    componentDidMount() {
        try {
            window.WavesKeeper.initialPromise
                .then((api) => {

                    let chainConnector = new BlockchainConnector(api);

                    this.setState({
                        chainConnector: chainConnector
                    });
                    console.log("component did mount");
                })
        } catch {
            this.setState({chainConnector: undefined});
        }
    }

    handleMenuClick(e, { name }) {
        this.setState({ activeItem: name });
    }

    refresh() {
        this.forceUpdate();
    }

    renderUserType() {
        switch (this.state.activeItem) {
            case "sender":
                return (
                    <EscrowManager
                        passHash={window.sessionStorage.getItem("passwordHash")}
                        chainConnector={this.state.chainConnector}/>
                );
            case "recipient":
                return (
                    <EscrowManagerRecipient
                        passHash={window.sessionStorage.getItem("passwordHash")}
                        chainConnector={this.state.chainConnector}/>
                );
        }
    }

    render() {
        if (this.state.chainConnector === undefined) {
            return(
                <Container textAlign='center' style={{'paddingTop': '100px'}}>
                    <Header>Waves Keeper is required to use this app. Please activate Keeper and reload the page.</Header>
                    <Container text>
                        If you do not have Waves Keeper installed, you can download the plugin from
                        <a href="https://wavesplatform.com/products-keeper" target='_blank'> the official site</a>.
                    </Container>
                </Container>
            );
        }
        else if (!window.sessionStorage.getItem("passwordHash")) {
            return(
                <PasswordPrompt parentCallback={this.refresh}/>
            )
        }
        else {
            return(
                [
                    <Menu>
                        <Menu.Item
                            name='recipient'
                            active={this.state.activeItem === 'recipient'}
                            onClick={this.handleMenuClick}
                        >
                            Ticket store
                        </Menu.Item>
                    </Menu>,
                    <div className="ui container">
                        <h1 className="ui dividing header">Welcome to the store</h1>
                        <KeeperStatus chainConnector={this.state.chainConnector}/>
                        {this.renderUserType()}
                    </div>
                ]
            )
        }

    }
}