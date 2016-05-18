namespace AntShares.Wallets
{
    export abstract class ContractItem
    {
        public RedeemScript: Uint8Array;
        public ScriptHash: Uint8Array;
        public PublicKeyHash: Uint8Array;
        public Type: string;
        public Address: string;
        public abstract IsCompleted(publicKeys: Array<Cryptography.ECPoint>): boolean
    }
}