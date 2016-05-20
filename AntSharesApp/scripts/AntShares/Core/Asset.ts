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

        /*发行者的公钥(33位的压缩公钥的16进制表示)*/
        public issuer: string;

        /*管理员白地址*/
        public admin: string;
    }

    export class AssetName
    {
        public lang: string;
        public name: string;
    }
}