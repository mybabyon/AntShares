class SignatureContract {
    constructor(publicKey: ECPoint) {
        this.publicKey = publicKey;
        this.RedeemScript = SignatureContract.CreateSignatureRedeemScript(publicKey);
    }
    PublicKeyHash: Uint8Array;
    RedeemScript: Uint8Array;
    publicKey: ECPoint;

    public static CreateSignatureRedeemScript(publicKey: ECPoint): Uint8Array {
        return new Uint8Array(0);
        //TODO: 2016.3.30 创建RedeemScript
    }
}