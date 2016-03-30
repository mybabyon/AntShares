class ContractStore {
    constructor(scriptHash: Uint8Array, rawData: Uint8Array, publicKeyHash: Uint8Array, type: string) {
        this.ScriptHash = scriptHash;
        this.RawData = rawData;
        this.PublicKeyHash = publicKeyHash;
        this.Type = type;
    }
    public ScriptHash: Uint8Array;
    public RawData: Uint8Array;
    public PublicKeyHash: Uint8Array;
    public Type: string;
}
