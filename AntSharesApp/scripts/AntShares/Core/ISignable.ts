namespace AntShares.Core
{
    export class ISignable
    {
        public Sign(account: Wallets.AccountItem): Uint8Array
        {
            let point = Cryptography.ECPoint.fromUint8Array(account.PublicKey, Cryptography.ECCurve.secp256r1);
            let key = new Cryptography.ECDsaCryptoKey(point);
            let ecdsa = new Cryptography.ECDsa(key);
            let hash = new Uint8Array(0);//可签名对象序列化后的Hash
            ecdsa.sign(hash);
            return new Uint8Array(0);
        }
    }
}