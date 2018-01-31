import * as assert from "assert";
import { DynamoDB } from "aws-sdk";
import * as chalk from "chalk";
import { isEmpty } from "lodash";
import { put, scan } from "../src/core";

const log = console.log;

const cfg = {
    accessKeyId: "cUniqueSessionID",
    credentialProvider: undefined,
    endpoint: "http://localhost:8000",
    region: "us-west-2",
    sslEnabled: true,
};

const TableName = "dyno_cool_table";

const TableParams = {
    AttributeDefinitions: [
        {
            AttributeName: "id",
            AttributeType: "S",
        },
    ],
    KeySchema: [
        {
            AttributeName: "id",
            KeyType: "HASH",
        },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 3,
        WriteCapacityUnits: 10,
    },
    StreamSpecification: {
        StreamEnabled: false,
    },
    TableName: TableName,
};

describe("Dynamo Cool", () => {
    before("Create Table", done => {
        const dynamoClient = new DynamoDB(cfg);
        try {
            const createTableResult =  dynamoClient.createTable(TableParams).promise();
            Promise.all([createTableResult]);
        } catch (e) {
            log.apply(chalk.default.red("Failed to create table", e));
        } finally {
            done();
        }
    });
    after("Delete Table", done => {
        const ddClient = new DynamoDB(cfg);
        try {
            const deleteResult = ddClient.deleteTable({ TableName: TableName }).promise();
            Promise.all([deleteResult]);
            done();
        } catch (e) {
            log(chalk.default.red("Failed to delete table", e));
        }
    });

    describe("Put", () => {
        const db = new DynamoDB.DocumentClient(cfg);
        it("should successfully put an item", done => {
            setTimeout( () => {
                const params = {
                    Item: {
                        id: "1",
                        name: "one",
                    },
                    TableName,
                };
                const result = put(db, params);
                result.map(it => it.$response.error).map(it => assert.deepEqual(it, undefined)).run();
                done();
            }, 300);
        });
        it("should handle exception", done => {
            setTimeout( () => {
                const params = {
                    Item: {
                        id: "1",
                        name: "one",
                    },
                    TableName
                };
                const result = put(new DynamoDB.DocumentClient(), params);
                result.mapLeft(err => assert.notEqual(err, undefined)).run();
                done();
            }, 300);
        });
    });

    describe("Scan", () => {
        const db = new DynamoDB.DocumentClient(cfg);
        before("Add Test Data", done => {
            const params = {
                Item: {
                    id: "1091",
                    name: "one thousand and ninety one",
                },
                TableName
            };
            put(db, params).run();
            done();
        });
        it("should return items when it scans", done => {
            setTimeout( () => {
                const params = { TableName };
                scan(db, params)
                    .map(it => {
                        assert.equal(isEmpty(it.Items), false);
                    })
                    .run();
                done();
            }, 300);
        });
        it("should handle exceptions", done => {
            setTimeout(() => {
                const params = {
                    Item: {
                        id: "1091",
                        name: "one thousand and ninety one",
                    },
                    TableName
                };
                put(new DynamoDB.DocumentClient(), params)
                    .mapLeft(err => assert.notEqual(err, undefined))
                    .run();
                done();
            }, 300);
        });
    });
});
