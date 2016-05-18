namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        public asset: Asset

        public SerializeExclusiveData(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array[this.asset.type]);
            let name = JSON.stringify(this.asset.name);
            array.push(name.toUint8Array()); 
            array.push(new Uint8Array[this.asset.low % 256]);
            array.push(new Uint8Array[this.asset.low % 65536 / 256]);
            array.push(new Uint8Array[this.asset.low % 65536]);
            array.push(new Uint8Array[this.asset.low / 65536]);
            array.push(new Uint8Array[this.asset.high % 256]);
            array.push(new Uint8Array[this.asset.high % 65536 / 256]);
            array.push(new Uint8Array[this.asset.high % 65536]);
            array.push(new Uint8Array[this.asset.high / 65536]);

            let length = 0;
            for (let i of array)
            {
                length += i.length;
            }
            let result = new Uint8Array(length);
            let p = 0;
            for (let i of array)
            {
                result.set(i, p);
                p += i.length;
            }
            return result;
        }
    }

}