namespace AntShares.Core
{
    export class Transaction
    {
        public txid: string;
        public hex: string;
        public type: TransactionType;
        public attributes: Array<TransactionAttribute>;
        public vin: Array<TransactionInput>;
        public vout: Array<TransactionOutput>;
        public scripts: Array<Script>;
    }

    export class TransactionInput
    {
        constructor(public txid: Uint8Array, public vout: number)
        {

        }
    }

    export class TransactionOutput
    {
        public n: number;
        public asset: Uint8Array;
        public value: number;
        public high: number;
        public low: number;
        public address: Uint8Array;
    }

    export class TransactionAttribute
    {
        public usage: TransactionAttributeUsage;
        public data: string;
    }

    
}