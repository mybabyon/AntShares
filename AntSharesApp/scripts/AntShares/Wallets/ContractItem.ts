namespace AntShares.Wallets
{
    export class ContractItem
    {
        constructor(public ScriptHash: Uint8Array, public RawData: Uint8Array,
            public PublicKeyHash: Uint8Array, public Type: string, public Address: string) { }
    }
}