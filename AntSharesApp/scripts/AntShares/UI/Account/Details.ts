namespace AntShares.UI.Account
{
    export class Details extends TabBase
    {
        protected oncreate(): void
        {

        }

        protected onload(args: any[]): void
        {

            let i = args[0] as number;
            let x = AccountList.List[i].PublicKey.subarray(0, 32);
            let y = AccountList.List[i].PublicKey.subarray(32, 64);
            let ecpoint = new Cryptography.ECPoint(
                new Cryptography.ECFieldElement(new BigInteger(x), Cryptography.ECCurve.secp256r1),
                new Cryptography.ECFieldElement(new AntShares.BigInteger(y), Cryptography.ECCurve.secp256r1),
                Cryptography.ECCurve.secp256r1);
            $("#public_key").text(ecpoint.encodePoint(true).toHexString());
            exportPrivateKey(AccountList.List[i].PrivateKey, (wif) =>
            {
                $("#privatekey_export").text(wif);
            });
            $("#privatekey_hex").text(AccountList.List[i].PrivateKey.toHexString());
        }
    }

    /**
     * 将私钥以WIF格式导出
     * 参考AntSharesCore项目中的AntShares.Wallets.Account Export();
     * @param privateKey 私钥
     * @param callback 导出后调用的方法，通过回调函数把wif格式的导出传出
     */
    export function exportPrivateKey(privateKey: Uint8Array, callback: (wif: string) => any)
    {
        let data = new Uint8Array(38);
        data[0] = 0x80;
        data.set(privateKey, 1);
        data[33] = 0x01;

        sha256Twice(data.subarray(0, 34), (hash2) =>
        {
            let check = hash2.subarray(0, 4);
            data.set(check, 34);
            let wif = data.base58Encode();
            callback(wif);
        })
    }
}