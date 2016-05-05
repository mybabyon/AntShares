namespace AntShares.Core
{
    export class TransactionOutput
    {
        public n: number;
        public asset: Uint8Array;
        public value: number;
        public high: number;
        public low: number;
        public address: string;
    }
}