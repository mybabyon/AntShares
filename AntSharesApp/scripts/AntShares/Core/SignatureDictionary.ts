namespace AntShares.Core
{
    export class SignatureDictionary
    {

        public Signatures: Signature[];
        public ContainsKey(PubKey: Cryptography.ECPoint): boolean
        {
            for (let i of this.Signatures)
            {
                if (i.PubKey === PubKey)
                    return true;
            }
            return false;
        }
        public Set(key: Cryptography.ECPoint, value: Uint8Array)
        {
            for (let i = 0; i < this.Signatures.length; i++)
            {
                if (this.Signatures[i].PubKey === key)
                    this.Signatures[i].Signature = value;
            }
        }
        public Add(key: Cryptography.ECPoint, value: Uint8Array)
        {
            this.Signatures.push(new Signature(key, value));
        }
        public GetKeys(): Array<Cryptography.ECPoint>
        {
            let keys = new Array<Cryptography.ECPoint>();
            for (let i of this.Signatures)
            {
                keys.push(i.PubKey);
            }
            return keys;
        }
    }

    export class Signature
    {
        constructor(public PubKey: Cryptography.ECPoint, public Signature: Uint8Array) { };

    }
}