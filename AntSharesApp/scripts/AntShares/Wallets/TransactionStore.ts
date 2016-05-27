﻿namespace AntShares.Wallets {
    export class TransactionStore {
        constructor(public Hash: string, public Type: AntShares.Core.TransactionType,
            public Attributes: AntShares.Core.TransactionAttribute[], public Inputs: AntShares.Core.TransactionInput[],
            public Outputs: AntShares.Core.TransactionOutput[]) {

        }
    }
}