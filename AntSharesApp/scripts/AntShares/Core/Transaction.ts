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
        constructor(public prevHash: string, public prevIndex: number)
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
        public address: string;
    }

    export class TransactionAttribute
    {
        public usage: TransactionAttributeUsage;
        public data: string;
    }

    
}