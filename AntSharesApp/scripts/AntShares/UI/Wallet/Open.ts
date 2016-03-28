namespace AntShares.UI.Wallet {
    export class Open extends TabBase {
        protected oncreate(): void {
            $(this.target).find("button").click(this.OnOpenButtonClick);
        }

        protected onload(): void {
            let wallet = AntShares.Wallets.Wallet.CreateInstance();
            wallet.OpenDB();
        }

        private OnOpenButtonClick() {

            let wallet = AntShares.Wallets.Wallet.CreateInstance();
            wallet.CreateWallet(toUint8Array(encodeUTF8($("#password").val())));

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
