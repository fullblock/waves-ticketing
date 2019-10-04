import React from "react";
import {base58Encode, base64Encode, keccak} from "@waves/ts-lib-crypto";
import storageUtils from "../../../utils/storageUtils";
import b58 from "bs58";
import {Table} from "semantic-ui-react";

import Deployer from "./Deployer";
import DeployedEscrow from "./DeployedEscrow"

const wait = (delay) =>
    new Promise(resolve => setTimeout(resolve, delay));

export default class EscrowManager extends React.Component {

    constructor(props) {
        super(props);
        this.deleteRow = this.deleteRow.bind(this);
        this.addRow = this.addRow.bind(this);
        this.updateRow = this.updateRow.bind(this);
        this.delayedStatusUpdate = this.delayedStatusUpdate.bind(this);

        this.state = {
            secret: props.passHash,
            storageKey: base58Encode(keccak(props.passHash)),
            rows: {}
        };


    }

    componentDidMount() {

        this.loadRows(this.state.secret, this.state.storageKey);

    }

    loadRows(secret, key) {
        let data = storageUtils.readAndDecrypt(key, secret);
        if (!data) {
            this.setState({
                rows: {}
            });
            storageUtils.encryptAndWrite(key, JSON.stringify({}), secret);
        } else {

            let simpleData = JSON.parse(data);
            let reconstructedData = {};
            Object.keys(simpleData).forEach(key => {
                let row = simpleData[key];
                row.parentKey = key;
                row.parentCallback = this.deleteRow;
                reconstructedData[key] = row;
            });

            this.setState({
                rows: reconstructedData
            }, () => {
                this.delayedStatusUpdate();
            })

        }
    }

    delayedStatusUpdate() {

        wait(2000).then(() => {

            return new Promise((resolve, reject) => {
                try {
                    Object.keys(this.state.rows).forEach(key => {
                        this.props.chainConnector.fetchContractStatus(
                            this.state.rows[key].address,
                            this.state.rows[key].blockUnlocked,
                            this.state.rows[key].status
                        ).then(status => {
                            this.updateRow(key, "status", status)
                        })
                    });
                } catch (err) {
                    reject(err);
                }
                resolve();
            })
        }).then(this.delayedStatusUpdate).catch((err) => console.log);
    }

    updateRow(key, field, value) {

        let row = this.state.rows[key];

        let newRow = {
            address: row.address,
            counterparty: row.counterparty,
            sum: row.sum,
            expiry: row.expiry,
            status: row.status,
            verificationString: row.verificationString,
            explorerURL: row.explorerURL
        };

        newRow[field] = value;

        if (this.state.rows[key] == undefined) {
            return
        }

        this.saveRowToStorage(this.state.secret, this.state.storageKey, key, newRow);

        newRow.parentKey = key;
        newRow.parentCallback = this.deleteRow;

        let newRows = this.state.rows;
        newRows[key] = newRow;

        this.setState(
            {
                rows: newRows
            }
        )

    }

    saveRowToStorage(secret, key, rowKey, row) {
        let data = JSON.parse(storageUtils.readAndDecrypt(key, secret));
        data[rowKey] = row;

        let stringData = JSON.stringify(data);
        storageUtils.encryptAndWrite(key, stringData, secret)
    }

    deleteRowFromStorage(secret, key, rowKey) {
        let data = JSON.parse(storageUtils.readAndDecrypt(key, secret));
        delete data[rowKey];

        let stringData = JSON.stringify(data);
        storageUtils.encryptAndWrite(key, stringData, secret)
    }

    addRow(rowData) {

        let row = {
            address: rowData.address,
            counterparty: rowData.counterparty,
            sum: rowData.sum,
            expiry: rowData.expiry,
            status: rowData.status,
            verificationString: rowData.verificationString,
            explorerURL: this.props.chainConnector.getExplorerURL() + 'address/' + rowData.address
        };

        let rowString = b58.encode(Buffer.from(JSON.stringify(row)));

        let key = base64Encode(keccak(rowString));

        this.saveRowToStorage(this.state.secret, this.state.storageKey, key, row);

        row.parentKey = key;
        row.parentCallback = this.deleteRow;

        let newRows = this.state.rows;
        newRows[key] = row;

        this.setState(
            {
                rows: newRows
            }
        )
    }

    deleteRow(key) {

        this.deleteRowFromStorage(this.state.secret, this.state.storageKey, key);

        let newRows = this.state.rows;
        delete newRows[key];


        this.setState(
            {
                rows: newRows
            }
        )
    }


    render() {
        return [
            <Table striped key="Tracker">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell> Escrow address </Table.HeaderCell>
                        <Table.HeaderCell> Counterparty address </Table.HeaderCell>
                        <Table.HeaderCell> Sum </Table.HeaderCell>
                        <Table.HeaderCell> Expiry block </Table.HeaderCell>
                        <Table.HeaderCell> State </Table.HeaderCell>
                        <Table.HeaderCell> </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {Object.keys(this.state.rows).map(key => {
                        return <DeployedEscrow{...this.state.rows[key]} key={key}/>
                    })}
                </Table.Body>
            </Table>,
            <Deployer key="Deployer" chainConnector={this.props.chainConnector} parentCallback={this.addRow}/>
        ]
    }
}