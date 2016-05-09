class CoinStore
{
    private Name: string; //作为Core表的主键
    constructor(public Input: AntShares.Core.TransactionInput, public AssetId: Uint8Array,
        public Value: number, public Address: string, public State: AntShares.Core.CoinState)
    {
        this.Name = Input.toString();
    }
}