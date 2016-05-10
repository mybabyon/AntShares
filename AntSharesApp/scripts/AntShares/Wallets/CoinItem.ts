namespace AntShares.Wallets
{
    export class CoinItem
    {
        constructor(public Input: Core.TransactionInput, public Address: string,
            public State: AntShares.Core.CoinState, public AssetId: string, public Value: number) { }
        public toKey(): string
        {
            return this.Input.txid + this.Input.vout + this.AssetId + this.Value + this.Address + this.State;
        }
    }
}
import CoinItem = AntShares.Wallets.CoinItem;