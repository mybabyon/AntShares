namespace AntShares.Wallets
{
    export class SignatureContract
    {
        public RedeemScript: Uint8Array;
        public PublicKeyHash: Uint8Array;
        constructor(private publicKey: Cryptography.ECPoint)
        {
            this.RedeemScript = this.CreateSignatureRedeemScript(publicKey);
        }
        public CreateSignatureRedeemScript(publicKey: Cryptography.ECPoint): Uint8Array
        {
            let sb = new Core.Scripts.ScriptBuilder()
            sb.push(publicKey.encodePoint(true));
            sb.add(Core.Scripts.ScriptOp.OP_CHECKSIG);
            return sb.toArray();
        }
    }
}