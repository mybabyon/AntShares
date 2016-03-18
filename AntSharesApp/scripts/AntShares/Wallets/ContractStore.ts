class ContractStore {
    constructor(scriptHash: string, rawData: number[], publicKeyHash: string, type: string) {
        this.ScriptHash = scriptHash;
        this.RawData = rawData;
        this.PublicKeyHash = publicKeyHash;
        this.Type = type;
    }
    public ScriptHash: string;
    public RawData: number[];
    public PublicKeyHash: string;
    public Type: string;
}
