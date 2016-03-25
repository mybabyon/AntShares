
namespace AntShares.UI.Wallet {
    export class Create extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnCreateButtonClick);
        }

        protected onload(): void {

            let wallet = AntShares.Wallets.Wallet.CreateInstance();
            wallet.OpenDB();
        }

        private OnCreateButtonClick() {
            let password = $("#password").val();
            let uint8array = new Uint8Array(password.length);
            for (var i = 0; i < password.length; i++) {
                uint8array[i] = password.charCodeAt(i);
            }
            let wallet = AntShares.Wallets.Wallet.CreateInstance();
            wallet.CreateWallet(uint8array);


            //生成随机数
            //window.crypto.subtle.generateKey(
            //    { name: "ECDSA", namedCurve: "P-256" },
            //    true,
            //    ["sign", "verify"]
            //)
            //    .then(p => {
            //        return window.crypto.subtle.exportKey("jwk", p.privateKey); //导出私钥
            //    })
            //    .catch(err => {
            //        console.error(err);
            //    })
            //    .then(p => {
            //        let prikey = p.d.base64UrlDecode();
            //        let pubkey = p.d.base64UrlDecode();

            //        //对私钥用MasterKey加密
            //        let masterKey = wallet.GetDataByKey(StoreName.Key, "MasterKey");
            //        let m = 1;
            //        //创建账户
            //        //let account = new AccountStore(prikey); 
            //        //console.log(account.PrivateKey);
            //    });
            //wallet.AddAccount(new AccountStore());

        }

    }

}
