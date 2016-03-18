class Account {
    constructor(privateKey: number[], publicKey: number[], publicKeyHash: number[] ) {
        this.PrivateKey = privateKey;
        this.PublicKey = publicKey;
        this.PublicKeyHash = publicKeyHash;
    }
    PrivateKey: number[];
    PublicKey: number[];
    PublicKeyHash: number[];
}