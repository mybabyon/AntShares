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
            $("#public_key").text(AccountList.List[i].PublicKeyHash.base58Encode());
            exportPrivateKey(AccountList.List[i].PrivateKey, (wif) =>
            {
                $("#privatekey_export_b").text(wif);
            });
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
        let d = data.subarray(0, 34);

        window.crypto.subtle.digest(
            {
                name: "SHA-256",
            },
            d
        )
            .then((hash) =>
            {
                let check = (new Uint8Array(hash)).subarray(0, 4);
                data.set(check, 34);
                let wif = data.base58Encode();
                callback(wif);
            })
            .catch(function (err)
            {
                console.error(err);
            });
    }
}