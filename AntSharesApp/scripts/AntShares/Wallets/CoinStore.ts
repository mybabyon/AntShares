class CoinStore
{
    constructor(public TxId: string, public Index: number, public AssetId: Uint8Array,
        public Value: number, public Address: string, public State: AntShares.Core.CoinState)
    {

    }
}