namespace AntShares.Wallets
{
    export class ContractItem
    {
        ScriptHash: Uint8Array;
        RawData: Uint8Array;
        PublicKeyHash: Uint8Array;
        Type: string;
        Address: string;
    }
}