class ContractStore {
    constructor(scriptHash: Uint8Array, rawData: any, publicKeyHash: Uint8Array, type: string) {
        this.ScriptHash = scriptHash;
        this.RawData = rawData;
        this.PublicKeyHash = publicKeyHash;
        this.Type = type;
        this.Name = scriptHash.base58Encode();
    }
    Name: string;
    ScriptHash: Uint8Array;
    RawData: Uint8Array;
    PublicKeyHash: Uint8Array;
    Type: string;
}
