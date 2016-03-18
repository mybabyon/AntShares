namespace AntShares.UI.Wallet {
    export class Create extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnCreateButtonClick);
        }

        protected onload(): void {

        }

        private OnCreateButtonClick() {

            let password = $("#password").val();
            //TODO: js字符串转Uint8Array https://github.com/inexorabletash/undefined
            let wallet = new AntShares.Wallets.Wallet(password, true);


            //生成随机数
            window.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]).then(p => {
                return window.crypto.subtle.exportKey("jwk", p.privateKey); //导出私钥
            }).then(p => {
                let prikey = p.d.base64UrlDecode();
                let pubkey = p.d.base64UrlDecode(); 
                //创建账户
                //let account = new Account(prikey); 
                //console.log(account.PrivateKey);
                });
            
            //wallet.AddAccount(new AccountStore());

        }

    }

}
