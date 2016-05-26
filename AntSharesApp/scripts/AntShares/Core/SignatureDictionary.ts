namespace AntShares.Core
{
    export class SignatureDictionary
    {

        public signatures: Signature[];
        public containsKey(PubKey: Cryptography.ECPoint): boolean
        {
            for (let i of this.signatures)
            {
                if (i.PubKey === PubKey)
                    return true;
            }
            return false;
        }
        public set(key: Cryptography.ECPoint, value: Uint8Array)
        {
            for (let i = 0; i < this.signatures.length; i++)
            {
                if (this.signatures[i].PubKey === key)
                    this.signatures[i].Signature = value;
            }
        }
        public add(key: Cryptography.ECPoint, value: Uint8Array)
        {
            this.signatures.push(new Signature(key, value));
        }
        public getKeys(): Array<Cryptography.ECPoint>
        {
            let keys = new Array<Cryptography.ECPoint>();
            for (let i of this.signatures)
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