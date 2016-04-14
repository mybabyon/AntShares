class AccountStore {
    constructor(name: string, publicKeyHash: Uint8Array, privateKeyEncrypted: Uint8Array) {
        this.PublicKeyHash = publicKeyHash;
        this.PrivateKeyEncrypted = privateKeyEncrypted;
        this.Name = name;
    }
    Name: string;
    PublicKeyHash: Uint8Array;
    PrivateKeyEncrypted: Uint8Array;
}