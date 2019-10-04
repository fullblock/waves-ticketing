import React from "react";
import {Table} from "semantic-ui-react";


export default class KeeperStatus extends React.Component {
    constructor(props) {
        super(props);

    }

    componentDidMount() {

        let keeperState = this.props.chainConnector.getKeeperState()

        if (keeperState) {
            this.setState({
                keeperState: keeperState
            })
        }

        this.props.chainConnector.onUpdate((state) => {
            this.setState({
                keeperState: state
            })
        })
    }

    render() {
        let text;

        if (this.state) {
            text = (
                <div>
                    <Table.Row>
                        <Table.Cell>
                            Your Address:
                        </Table.Cell>
                        <Table.Cell>
                            <div className="ui label"> {this.state.keeperState['account']['address']} </div>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>
                            Network:
                        </Table.Cell>
                        <Table.Cell>
                            <div className="ui label"> {this.state.keeperState["network"]['code'] === 'T' ? "Testnet" : "Mainnet" } </div>
                        </Table.Cell>
                    </Table.Row>
                </div>
            );
        } else {
            text = (
                <Table.Row>
                    <Table.Cell>
                        <h3>"Cannot connect to Waves Keeper!"</h3>
                    </Table.Cell>
                </Table.Row>
            );
        }

        return(
            <div>
                <Table>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell><h2>Your are logged in with Waves Keeper</h2></Table.Cell>
                        </Table.Row>
                        {text}
                    </Table.Body>
                </Table>
            </div>
        );
    }
}