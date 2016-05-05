namespace AntShares.Core
{
    export class RegisterTransaction extends Transaction
    {
        /*资产类型*/
        public AssetType: AssetType;
        /*资产名称*/
        public name: string;
        /*发行总量*/
        public Amount: number;
        /*发行者的公钥*/
        public Issur: Cryptography.ECPoint;
        /*管理员白ScriptHash*/
        public Admin: Uint8Array;

        public GetHashData(): Uint8Array
        {
            
            return new Uint8Array(0);
        }
    }

}