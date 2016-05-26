namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        /*资产类型*/
        public assetType: AssetType;

        /*资产名称*/
        public name: string;

        /*发行总量*/
        public amount: Fixed8;

        /*发行者的公钥*/
        public issuer: Cryptography.ECPoint;

        /*管理员的地址 合约中的ScriptHash，160位的byte数组 */
        public admin: Uint8Array;

        constructor()
        {
            super(TransactionType.RegisterTransaction);
        }

        public serializeExclusiveData(): Uint8Array
        {
            let array = new Array<Uint8Array>();
            array.push(new Uint8Array([this.type]));
            let name = this.name;
            array.push(name.serialize()); 
            array.push(this.amount.serialize());
            array.push(this.issuer.serialize());
            array.push(this.admin);
            return ToUint8Array(array);
        }
    }
}