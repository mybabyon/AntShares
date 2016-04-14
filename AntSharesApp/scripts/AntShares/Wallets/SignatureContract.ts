namespace AntShares.Wallets
{
    export class SignatureContract
    {
        constructor(private publicKey: AntShares.Cryptography.ECPoint)
        {
            this.RedeemScript = SignatureContract.CreateSignatureRedeemScript(publicKey);
            if (Account.PublicKeyHash)
            {
                this.PublicKeyHash = Account.PublicKeyHash;
            }
        }
        RedeemScript: Uint8Array;
        PublicKeyHash: Uint8Array;


        public static CreateSignatureRedeemScript(publicKey: AntShares.Cryptography.ECPoint): Uint8Array
        {
            let sb = new AntShares.Core.Scripts.ScriptBuilder()
            sb.push(publicKey.encodePoint(true));
            sb.add(AntShares.Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }


    }
}