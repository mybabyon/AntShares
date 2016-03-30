class AccountStore {
    constructor(publicKeyHash: Uint8Array, privateKeyEncrypted: Uint8Array) {
        this.PublicKeyHash = publicKeyHash;
        this.PrivateKeyEncrypted = privateKeyEncrypted;
    }
    PublicKeyHash: Uint8Array;
    PrivateKeyEncrypted: Uint8Array;
}