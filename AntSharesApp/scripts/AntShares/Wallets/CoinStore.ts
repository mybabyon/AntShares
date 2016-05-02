class CoinStore
{
    constructor(public TxId: Uint8Array, public Index: number, public AssetId: Uint8Array, public Value: number, public ScriptHash: Uint8Array, public State: AntShares.Core.CoinState)
    {

    }
}