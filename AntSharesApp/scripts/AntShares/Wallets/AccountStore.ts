class AccountStore {
    constructor(publicKeyHash: Uint8Array, privateKeyEncrypted: Uint8Array) {
        this.PublicKeyHash = publicKeyHash;
        this.PrivateKeyEncrypted = privateKeyEncrypted;
        this.Name = publicKeyHash.base58Encode();
    }
    Name: string;
    PublicKeyHash: Uint8Array;
    PrivateKeyEncrypted: Uint8Array;
}