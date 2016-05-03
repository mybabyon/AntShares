namespace AntShares.Wallets
{
    export class CoinItem
    {
        Input: Core.TransactionInput;
        Address: string;
        State: AntShares.Core.CoinState;
        AssetId: Uint8Array;
        Value: number;
    }
}
