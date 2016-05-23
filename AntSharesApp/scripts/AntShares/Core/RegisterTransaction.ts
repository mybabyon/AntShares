namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        public asset: Asset
        constructor()
        {
            super(TransactionType.RegisterTransaction);
            this.asset = new Asset();
        }
        public SerializeExclusiveData(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array([this.asset.type]));
            let name = this.asset.name;
            array.push(name.serialize()); 
            array.push(this.asset.low.serialize(4));
            array.push(this.asset.high.serialize(4)); 
            //TODO: Issuer Admin
            return ToUint8Array(array);
        }
    }
}