namespace AntShares.Wallets
{
    export class CoinItem
    {
        Input: Core.TransactionInput;
        ScriptHash: Uint8Array;
        State: AntShares.Core.CoinState;
        AssetId: Uint8Array;
        Value: number;
    }
}
