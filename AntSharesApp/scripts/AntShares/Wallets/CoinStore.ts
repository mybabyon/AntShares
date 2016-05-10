class CoinStore
{
    private Name: string; //作为Core表的主键
    constructor(public Input: AntShares.Core.TransactionInput, public AssetId: string,
        public Value: number, public Address: string, public State: AntShares.Core.CoinState)
    {
        this.Name = Input.txid + Input.vout + AssetId + Value + Address + State;
    }
}