namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            
        }

        private OnOpenButtonClick() {
            let password = $("#password").val();
            let s = "1123432";
            var uint8array = new Uint8Array(password.length);
            for (var i = 0; i < password.length; i++) {
                uint8array[i] = password.charCodeAt(i);
            }
            let wallet = new AntShares.Wallets.Wallet();
            wallet.OpenDB();
            setTimeout(function () {
                //TODO:UWP下正常运行，Chrome下显示IndexedDB为readonly
                let account = new AccountStore("11111", "22222");
                wallet.AddAccount(account);
                setTimeout(function () {
                    wallet.TraversalData(StoreName.Account);
                    console.log(wallet.db);
                }, 1000);  
            }, 500);   
        }

    }

}
