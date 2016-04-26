namespace AntShares.Wallets
{
    export class Account
    {
        static PrivateKey: Uint8Array;
        static PublicKey: Uint8Array;
        static PublicECPoint: AntShares.Cryptography.ECPoint;
        static PublicKeyHash: Uint8Array;

        static clear()
        {
            this.PrivateKey = null;
            this.PublicKey = null;
            this.PublicECPoint = null;
            this.PublicKeyHash = null;
        }
    }
}