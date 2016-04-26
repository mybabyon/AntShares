namespace AntShares.Wallets
{
    export class SignatureContract
    {
        constructor(private publicKey: Cryptography.ECPoint)
        {
            this.RedeemScript = this.CreateSignatureRedeemScript(publicKey);
            if (Account.PublicKeyHash)
            {
                this.PublicKeyHash = Account.PublicKeyHash;
            }
        }
        RedeemScript: Uint8Array;
        PublicKeyHash: Uint8Array;


        public CreateSignatureRedeemScript(publicKey: Cryptography.ECPoint): Uint8Array
        {
            let sb = new Core.Scripts.ScriptBuilder()
            sb.push(publicKey.encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }


    }
}