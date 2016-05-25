namespace AntShares.Core
{
    export class Asset
    {
        /*资产类型*/
        public type: AssetType;

        /*资产名称*/
        public name: string;

        /*发行总量*/
        public high: number;
        public low: number;

        /*发行者的公钥*/
        public issuer: Cryptography.ECPoint;

        /*管理员的地址*/
        public admin: UintVariable;
    }

    export class AssetName
    {
        public lang: string;
        public name: string;
    }
}