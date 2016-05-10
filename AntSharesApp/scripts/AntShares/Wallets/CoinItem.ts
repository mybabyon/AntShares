namespace AntShares.Wallets
{
    export class CoinItem
    {
        constructor(public Input: Core.TransactionInput, public Address: string, public State: AntShares.Core.CoinState, public AssetId: Uint8Array, public Value: number) { }
    }
}
import CoinItem = AntShares.Wallets.CoinItem;