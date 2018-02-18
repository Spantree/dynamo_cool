import { AWSError, DynamoDB, Response } from "aws-sdk";
import * as taskEither from "fp-ts/lib/TaskEither";

export interface DynamoDbError {
    name: string;
    body?: Partial<any>;
    error: any;
}

export type ScanOutput = DynamoDB.DocumentClient.ScanOutput;
export type ScanResponse = Response<ScanOutput, AWSError>;
export type ScanResult = ScanOutput & { $response: ScanResponse };
export type ScanTaskResult = taskEither.TaskEither<DynamoDbError, ScanResult>;

/**
 * Typesafe wrapper for `scan`.
 * It returns a TaskEither that encodes an error and a successful scan result.
 * @param db
 * @param params
 */
export const scan = (
    db: DynamoDB.DocumentClient,
    params: DynamoDB.DocumentClient.ScanInput): ScanTaskResult => {
    const r = taskEither.tryCatch(
        () => db.scan(params).promise(),
        reason => {
            return {
                error: reason,
                body: params,
                name: "Error",
            };
        },
    );
    return r;
};

export type PutOutput = DynamoDB.DocumentClient.PutItemOutput;
export type PutResponse = Response<PutOutput, AWSError>;
export type PutResult = PutOutput & { $response: PutResponse };
export type PutTaskResult = taskEither.TaskEither<DynamoDbError, PutResult>;

/**
 * Typesafe wrpper for `put`.
 * @param db
 * @param params
 */
export const put = (
    db: DynamoDB.DocumentClient,
    params: DynamoDB.DocumentClient.PutItemInput): PutTaskResult => {
    const r =  taskEither.tryCatch(
        () => db.put(params).promise(),
        reason => {
            return {
                error: reason,
                body: params,
                name: "An error occurred putting an item in Dynamo",
            };
        },
    );
    return r;
};