namespace AntShares.Wallets
{
    export class CoinItem
    {
        constructor(public Input: Core.TransactionInput, public Address: string,
            public State: AntShares.Core.CoinState, public AssetId: string, public Value: number) { }
    }
}
import CoinItem = AntShares.Wallets.CoinItem;