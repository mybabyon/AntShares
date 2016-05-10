class ContractStore
{
    Name: string; //作为Contract表的主键
    constructor(public ScriptHash: Uint8Array, public RawData: any, public PublicKeyHash: Uint8Array, public Type: string)
    {
        this.Name = ScriptHash.base58Encode();
    }
}