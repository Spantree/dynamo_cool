# Dynamo Cool

This is a Typescript wrapper for doing basic operations on DynamoDB
in a typesafe way using [https://github.com/gcanti/fp-ts](https://github.com/gcanti/fp-ts).

## Motivation
When working with DynamoDB, _async/await_,  and a set of type abstractions, I've hit
cases where it has become impossible to chain calls because of the implicit return
type that _async/await_ functions come with. For example, given a function 
`put(doc: DynamoDB.DocumentClient, params: DynamoDB.DocumentClient.PutInputItem): Promise<Either<Error, DynamoDB.DocumentClient.PutOutputItem>`
and another function for finding items by id:
`findById(doc:DynamoDB.DocumentClient, id: string): Promise<Either<Error, DynamoDB.DocumentClient.GetOutputItem>>`
we have no way of composing those two functions. Ideally, I'd like to do something like this:

```Typescript
async findById(doc, someId)
    .chain(async (item) => {
        // Some business logic
        // Then save
        return await put(doc, params); // BOOM! The return type of an async function is `Promise<T>` while `chain` expects an `Either<E, T>`.
    })
    .chain(item => {
        //Do something else
    })
    .mapLeft(err => {
        //Handle error
    });
```

`FP-TS` provides an abstraction for async operations called `Task`. There is also
an equivalent `TaskEither` that encodes a `Right` and `Left` value. With `TaskEither` we
can forego the use of `async/await` (yeah I know, it is all the hype these days but I bumped into an edge
case where it is a deal breaker for me at the moment). Generally, with `TaskEither` we define
a pipeline of operations, and it will only be executed when we call `run` on the pipeline. This
prevents nasty implicit types that `async/await` forces us into. Eg.:

```Typescript
interface ScanError {
    name: string;
    error: Error;
}

const scanTE = (doc: DynamoDB.DocumentClient, tableName: string) => {
    const params = {
        ReturnConsumedCapacity: "TOTAL",
        TableName: tableName,
    };
    const r = taskEither.tryCatch(
        () => doc.scan(params).promise(),
        reason => {
            return {
                error: reason,
                name: "An error occurred trying to scan Dynamodb",
            };
        },
    );
    return r;
};

const printTE = (doc: DynamoDB.DocumentClient) => {
    const result = scanTE(doc, "pa-listings-stagin");
    const r = result.map(it => {
        return it.Items;
    });
    return r;
};

printTE(dbConfig)
    .map(items => {
        console.log(`Total Items: ${items.length}`);
    })
    .mapLeft(e => {
        console.error(`Error Name: ${e.name}`);
        console.error(`Error: ${e.error}`);
    })
    .run();
```

## Usage
TODO

## Development
TODO
