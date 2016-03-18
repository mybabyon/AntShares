class AccountStore {
    constructor(publicKeyHash: string, privateKeyEncrypted: string) {
        this.PublicKeyHash = publicKeyHash;
        this.PrivateKeyEncrypted = privateKeyEncrypted;
    }
    PublicKeyHash: string;
    PrivateKeyEncrypted: string;
}